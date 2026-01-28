"use client";

import Link from "next/link";
import Select from "./Select";
import JobCard from "../jobs/JobCard";
import type { Job } from "@/types/job";
import { getJobs } from "@/lib/api/jobs";
import { JobCardSkeleton } from "../jobs/JobCard";
import { useEffect, useMemo, useState } from "react";


type DatePostedFilter = "any" | "24h" | "7d" | "30d";
type JobTypeFilter = "any" | "onsite" | "remote" | "hybrid";
type EmploymentFilter = "any" | "full_time" | "part_time" | "internship";

function daysAgo(dateIso: string) {
    const now = new Date();
    const d = new Date(dateIso);
    const diffMs = now.getTime() - d.getTime();
    return diffMs / (1000 * 60 * 24);
}

export default function JobBoardDashboard() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    // Controls
    const [query, setQuery] = useState("");
    const [jobType, setJobType] = useState<JobTypeFilter>("any");
    const [employment, setEmployment] = useState<EmploymentFilter>("any");
    const [datePosted, setDatePosted] = useState<DatePostedFilter>("any");

    // Debounce (Keeps UI snappy)
    const [debounceQuery, setDebounceQuery] = useState(query);
    useEffect(() => {
        const t = setTimeout(() => setDebounceQuery(query), 250);
        return () => clearTimeout(t);
    }, [query]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);
            try {
                const data = await getJobs();
                if (mounted) setJobs(data);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const filtered = useMemo(() => {
        return jobs.filter((j) => {
            const matchesQuery =
                debounceQuery.trim().length === 0 ||
                j.title.toLocaleLowerCase().includes(debounceQuery.toLowerCase());

            const matchesJobType = jobType === "any" || j.jobType === jobType;
            const matchesEmployment = employment === "any" || j.employmentType === employment;

            const ageDays = j.createdAt ? daysAgo(j.createdAt) : 9999;
            const matchesDate =
                datePosted === "any" ||
                (datePosted === "24h" && ageDays <= 1) ||
                (datePosted === "7d" && ageDays <= 7) ||
                (datePosted === "30d" && ageDays <= 30);

            return matchesQuery && matchesJobType && matchesEmployment && matchesDate;
        })
    }, [jobs, debounceQuery, jobType, employment, datePosted]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* top glow */}
            <div className="pointer-events-none absolute insert-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top, rgba(16,185,129,0.18),transparent_60%)]" />

            <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* NAV PILL */}
                <header className="sticky top-4 z-20">
                    <div className="mx-auto flex items-center justify-between rounded-full bg-emerald-950/95 px-4 py-3 shadow-lg shadow-emerald-950/10 backdrop-bluer sm:px-6">
                        <Link
                            href="/"
                            className="flex items-center gap-3"
                        >
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-white shadow-sm">
                                <span className="text-sm font-semibold">JB</span>
                            </div>

                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-white">JobBoard</p>
                            </div>
                        </Link>

                        <nav className="hidden items-center gap-2 sm:flex">
                            <PillLink href="/jobs" label="Jobs" active />
                            <PillLink href="/applications" label="Applications" />
                            <PillLink href="/profile" label="Profile" />
                        </nav>

                        <div className="flex items-center gap-2">
                            <button
                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 text-sm text-white hover:bg-white/15 focus:ring-2 focus:ring-emerald-400/60 cursor-pointer"
                                aria-label="Account"
                            >
                                <span className="hidden sm:inline">Account</span>
                                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">👤</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* HERO / SEARCH */}
                <section className="pt-8 sm:pt-10">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                            Find your next role faster.
                        </h1>
                        <p className="mt-2 text-pretty text-sm text-slate-600 sm:text-base">
                            Search, filter, and explore curated roles from trusted employers.
                        </p>
                    </div>

                    {/* search bar */}
                    <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    🔎
                                </span>
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search job by title"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-3 text-sm outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                />
                            </div>

                            <button
                                type="button"
                                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                                onClick={() => {
                                    // trigger refetch with query params if backend supports it but this will be optional
                                }}
                            >
                                Search
                            </button>
                        </div>

                        {/* filters */}
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <Select
                                label="Job Type"
                                value={jobType}
                                onChange={(v) => setJobType(v as JobTypeFilter)}
                                options={[
                                    ["any", "Any"],
                                    ["remote", "Remote"],
                                    ["onsite", "On-site"],
                                    ["hybrid", "Hybrid"],
                                ]}
                            />
                            <Select
                                label="Employment Type"
                                value={employment}
                                onChange={(v) => setEmployment(v as EmploymentFilter)}
                                options={[
                                    ["any", "Any"],
                                    ["full_time", "Full-time"],
                                    ["part_time", "Part-time"],
                                    ["contract", "Contract"],
                                    ["internship", "Internship"],
                                ]}
                            />
                            <Select
                                label="Date Posted"
                                value={datePosted}
                                onChange={(v) => setDatePosted(v as DatePostedFilter)}
                                options={[
                                    ["any", "Any time"],
                                    ["24h", "Last 24 hours"],
                                    ["7d", "Last 7 days"],
                                    ["30d", "Last 30 days"],
                                ]}
                            />
                        </div>
                    </div>
                </section>

                {/* JOB LIST */}
                <section className="mt-10">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5 sm:p-8">
                        <div className="flex  flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Browse Jobs</h2>
                                <p className="text-sm text-slate-600">
                                    Showing <span className="font-medium text-slate-900">{filtered.length}</span> roles
                                </p>
                            </div>

                            {/*employer quick action */}
                            <Link
                                href="/jobs/new"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                            >
                                ➕ Post a Job
                            </Link>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {loading && Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
                            {!loading && filtered.length === 0 && (
                                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white text-center">
                                    <p className="text-sm font-medium text-slate-900">No jobs match your filters.</p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Try clearing filters or searching a different keyword.
                                    </p>
                                    <button
                                        className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                                        onClick={() => {
                                            setQuery("");
                                            setJobType("any");
                                            setEmployment("any");
                                            setDatePosted("any");
                                        }}
                                    >
                                        Reset filters
                                    </button>
                                </div>
                            )}

                            {!loading &&
                                filtered.map((job) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        href={`/jobs/${job.id}`}
                                    />
                                ))
                            }
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

function PillLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={[
                "rounded-full px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-400/60",
                active ? "bg-white/15 text-white" : "text-emerald-100/80 hover:bg-white/10 hover:text-white",
            ].join(" ")}
        >
            {label}
        </Link>
    );
}
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Job } from "@/types/job";
import { getJobById, deleteJob } from "@/lib/api/jobs";
import { applyToJob } from "@/lib/api/applications";
import { useAuth } from "@/context/AuthContext";

function chipClass(kind: "solid" | "soft" = "soft") {
    return kind === "solid"
        ? "inline-flex items-center rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white"
        : "inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900";
}

function pretty(v?: string) {
    if (!v) return "";
    return v
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/(^|\s)\S/g, (t) => t.toUpperCase());
}

function formatLocation(job: Job) {
    const parts = [job.city, job.state, job.country].filter(Boolean);
    return parts.length ? parts.join(", ") : job.location || "Location";
}

function formatSalary(job: Job) {
    if (!job.is_salary_disclosed) return null;
    const min = job.salary_min ?? null;
    const max = job.salary_max ?? null;
    const currency = job.currency ?? "";

    if (min == null && max == null) return null;

    const fmt = (n: number) =>
        new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

    if (min != null && max != null) return `${currency} ${fmt(min)} – ${fmt(max)}`;
    if (min != null) return `${currency} ${fmt(min)}+`;
    return `${currency} up to ${fmt(max as number)}`;
}

export default function JobDetailClient() {
    const { user, isAuthenticated } = useAuth();
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    // Apply state
    const [coverLetter, setCoverLetter] = useState("");
    const [applying, setApplying] = useState(false);
    const [applyMsg, setApplyMsg] = useState<string | null>(null);

    // Optional fields for application payload (no UI yet)
    const resumeFile: File | null = null;
    const expectedSalary: string | number | null = null;
    const availableFrom: string | null = null;

    const isEmployer = user?.role === "EMPLOYER";
    const isCandidate = user?.role === "CANDIDATE";

    useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);
            try {
                const data = await getJobById(id);
                if (mounted) setJob(data);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [id]);

    const salary = useMemo(() => (job ? formatSalary(job) : null), [job]);
    const location = useMemo(() => (job ? formatLocation(job) : ""), [job]);

    async function onApply() {
        setApplyMsg(null);

        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        if (!isCandidate) {
            setApplyMsg("Only candidates can apply for jobs.");
            return;
        }

        if (!coverLetter.trim()) {
            setApplyMsg("Cover letter is required.");
            return;
        }

        setApplying(true);
        try {
            await applyToJob(id, {
                cover_letter: coverLetter.trim(),
                resume: resumeFile,
                expected_salary: expectedSalary || null,
                available_from: availableFrom || null,
            });

            setApplyMsg("Application submitted successfully");
            setCoverLetter("");
        } catch (err: any) {
            const data = err?.response?.data;
            const msg =
                data?.detail ||
                (typeof data === "object" ? JSON.stringify(data) : null) ||
                err.message ||
                "Failed to apply";
            setApplyMsg(msg);
        } finally {
            setApplying(false);
        }
    }


    async function onDelete() {
        if (!isEmployer) return;
        const ok = confirm("Delete this job? This cannot be undone.");
        if (!ok) return;

        try {
            await deleteJob(id);
            router.push("/");
        } catch (err: any) {
            alert(err?.message || "Failed to delete job");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-600">Loading job...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-900">Job not found.</p>
                        <Link href="/" className="mt-3 inline-flex text-sm text-emerald-700 hover:underline">
                            ← Back to jobs
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
            <div className="mx-auto max-w-5xl">
                {/* Top bar */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href="/" className="text-sm font-medium text-emerald-800 hover:underline">
                        ← Back to jobs
                    </Link>

                    {isEmployer && (
                        <div className="flex gap-2">
                            <Link
                                href={`/jobs/${job.id}/edit`}
                                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                            >
                                ✏️ Edit
                            </Link>
                            <button
                                onClick={onDelete}
                                className="inline-flex items-center justify-center rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main details */}
                    <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                        {job.title}
                                    </h1>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {job.country ?? (job as any).country ?? "Company"} • {location}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {job.job_type && <span className={chipClass("solid")}>{pretty(job.job_type)}</span>}
                                        {job.employment_type && <span className={chipClass()}>{pretty(job.employment_type)}</span>}
                                        {job.experience_level && <span className={chipClass()}>{pretty(job.experience_level)}</span>}
                                        {job.status && <span className={chipClass()}>{pretty(job.status)}</span>}
                                        {salary && <span className={chipClass()}>{salary}</span>}
                                        {job.application_deadline && (
                                            <span className={chipClass()}>
                                                Deadline: {job.application_deadline}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <section className="mt-8">
                                <h2 className="text-sm font-semibold text-slate-900">Description</h2>
                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                                    {job.description}
                                </p>
                            </section>

                            <TwoColLists job={job} />
                        </div>
                    </div>

                    {/* Apply card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-900">Apply for this role</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                {isAuthenticated
                                    ? isCandidate
                                        ? "Add an optional cover letter and submit your application."
                                        : "You are logged in as an employer."
                                    : "Login to apply for this job."}
                            </p>

                            <div className="mt-4">
                                <label className="text-xs font-medium text-slate-700">Cover letter (optional)</label>
                                <textarea
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    rows={6}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                    placeholder="Write a brief note to the employer..."
                                    disabled={!isAuthenticated || !isCandidate}
                                />
                            </div>

                            {applyMsg && (
                                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 whitespace-pre-line">
                                    {applyMsg}
                                </div>
                            )}

                            <button
                                onClick={onApply}
                                disabled={applying || (isAuthenticated && !isCandidate)}
                                className="mt-5 w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
                            >
                                {applying ? "Applying..." : isAuthenticated ? "Submit Application" : "Login to Apply"}
                            </button>

                            {!isAuthenticated && (
                                <Link
                                    href="/auth/login"
                                    className="mt-3 block text-center text-sm font-medium text-emerald-800 hover:underline"
                                >
                                    Go to login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TwoColLists({ job }: { job: Job }) {
    return (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ListBlock title="Responsibilities" items={job.responsibilities} />
            <ListBlock title="Requirements" items={job.requirements} />
            <ListBlock title="Nice to have" items={job.nice_to_have} />
            <ListBlock title="Benefits" items={job.benefits} />
        </div>
    );
}

function ListBlock({ title, items }: { title: string; items?: string[] }) {
    if (!items || items.length === 0) return null;

    return (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {items.map((t, idx) => (
                    <li key={idx} className="flex gap-2">
                        <span className="mt-0.5 text-emerald-700">•</span>
                        <span>{t}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

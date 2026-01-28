import Link from "next/link";
import type { Job } from "@/types/job";

export default function JobCard({ job, href }: { job: Job; href: string }) {
    return (
        <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:translate-y-1 hover:shadow-md">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-50 to-transparent" />

            <div className="relative p-5">
                <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-900 text-white shadow-sm">
                        <span className="text-sm font-semibold">
                            {(job.company?.name?.[0] ?? "J").toUpperCase()}
                        </span>
                    </div>

                    <div className="min-w-0 flex-3">
                        <h3 className="truncate text-base  font-semibold text-slate-900">
                            {job.title}
                        </h3>
                        <p className="truncate text-sm text-slate-600">
                            {job.company?.name ?? "Company"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge>
                                {prettyJobType(job.jobType)}
                            </Badge>
                            <Badge variant="soft">
                                {prettyEmployment(job.employmentType)}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                        📍 {job.location ?? "Location"}
                    </span>

                    <Link
                        href={href}
                        className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                    >
                        View Job →
                    </Link>
                </div>
            </div>
        </article>
    )
}

export function JobCardSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                <div className="flex-1">
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
                    <div className="mt-4 flex gap-2">
                        <div className="h-6 w-20 rounded-full bg-slate-200" />
                        <div className="h-6 w-24 rounded-full bg-slate-200" />
                    </div>
                </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
                <div className="h-8 w-28 rounded-full bg-slate-200" />
                <div className="h-9 w-24 rounded-full bg-slate-200" />
            </div>
        </div>
    );
}

function Badge({
    children,
    variant,
}: {
    children: React.ReactNode;
    variant?: "solid" | "soft";
}) {
    const base =
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
    const solid = "bg-emerald-700 text-white";
    const soft = "bg-emerald-100 text-emerald-900";

    return <span className={`${base} ${variant === "soft" ? soft : solid}`}>{children}</span>;
}

function prettyJobType(v?: string) {
    if (!v) return "Job";
    return v === "remote" ? "Remote" : v === "onsite" ? "On-site" : v === "hybrid" ? "Hybrid" : v;
}

function prettyEmployment(v?: string) {
    if (!v) return "Employment";
    return v === "full_time"
        ? "Full-time"
        : v === "part_time"
            ? "Part-time"
            : v === "contract"
                ? "Contract"
                : v === "internship"
                    ? "Internship"
                    : v;
}
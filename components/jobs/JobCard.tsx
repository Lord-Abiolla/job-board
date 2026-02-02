import Link from "next/link";
import type { Job } from "@/types/job";

export default function JobCard({ job, href = `/jobs/${job.id}/` }: { job: Job; href?: string }) {
    const salaryText = formatSalary(job);
    const deadlineText = job.application_deadline ? formatDate(job.application_deadline) : null;

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-50 to-transparent" />

            <div className="relative p-5">
                <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-900 text-white shadow-sm">
                        <span className="text-sm font-semibold">
                            {getAvatarLetter(job)}
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="truncate text-base font-semibold text-slate-900">
                                    {job.title}
                                </h3>

                                <p className="truncate text-sm text-slate-600 mb-3">
                                    {job.country}
                                </p>
                            </div>

                            {job.status && (
                                <span className={statusChip(job.status)}>
                                    {prettyStatus(job.status)}
                                </span>
                            )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {job.job_type && (
                                <Badge>{prettyJobType(job.job_type)}</Badge>
                            )}

                            {job.employment_type && (
                                <Badge variant="soft">{prettyEmployment(job.employment_type)}</Badge>
                            )}

                            {job.experience_level && (
                                <Badge variant="soft">{prettyExperience(job.experience_level)}</Badge>
                            )}

                            {salaryText && (
                                <Badge variant="soft">{salaryText}</Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                            {job.experience_level}
                        </span>

                        {deadlineText && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                                ⏳ {deadlineText}
                            </span>
                        )}
                    </div>

                    <Link
                        href={href}
                        className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                    >
                        View Job →
                    </Link>
                </div>
            </div>
        </article>
    );
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
                        <div className="h-6 w-20 rounded-full bg-slate-200" />
                    </div>
                </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
                <div className="h-8 w-40 rounded-full bg-slate-200" />
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
    const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
    const solid = "bg-emerald-700 text-white";
    const soft = "bg-emerald-100 text-emerald-900";

    return <span className={`${base} ${variant === "soft" ? soft : solid}`}>{children}</span>;
}

function getAvatarLetter(job: Job) {
    const source =
        job.country ||
        (job as any).company_name ||
        job.title ||
        job.city ||
        job.location ||
        "J";

    return String(source).trim().charAt(0).toUpperCase();
}

function formatLocation(job: Job) {
    const parts = [job.city, job.state, job.country].filter(Boolean);
    if (parts.length) return parts.join(", ");
    return job.location || "Location";
}

function formatDate(iso: string) {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    } catch {
        return iso;
    }
}

function formatSalary(job: Job) {
    // show only if backend says disclose
    if (!job.is_salary_disclosed) return null;

    const min = job.salary_min ?? null;
    const max = job.salary_max ?? null;
    const currency = job.currency ?? "";

    // nothing to show
    if (min == null && max == null) return null;

    const fmt = (n: number) =>
        new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

    if (min != null && max != null) return `${currency} ${fmt(min)} – ${fmt(max)}`;
    if (min != null) return `${currency} ${fmt(min)}+`;
    return `${currency} up to ${fmt(max as number)}`;
}

function statusChip(status: string) {
    const base =
        "shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset";
    switch (status) {
        case "ACTIVE":
            return `${base} bg-emerald-50 text-emerald-800 ring-emerald-200`;
        case "DRAFT":
            return `${base} bg-slate-50 text-slate-700 ring-slate-200`;
        case "CLOSED":
            return `${base} bg-amber-50 text-amber-800 ring-amber-200`;
        case "EXPIRED":
            return `${base} bg-red-50 text-red-700 ring-red-200`;
        default:
            return `${base} bg-slate-50 text-slate-700 ring-slate-200`;
    }
}

function prettyStatus(v?: string) {
    if (!v) return "";
    return v === "ACTIVE"
        ? "Active"
        : v === "DRAFT"
            ? "Draft"
            : v === "CLOSED"
                ? "Closed"
                : v === "EXPIRED"
                    ? "Expired"
                    : v;
}

function prettyJobType(v?: string) {
    if (!v) return "Job";
    return v === "REMOTE" ? "Remote" : v === "ONSITE" ? "On-site" : v === "HYBRID" ? "Hybrid" : v;
}

function prettyEmployment(v?: string) {
    if (!v) return "Employment";
    return v === "FULL_TIME"
        ? "Full-time"
        : v === "PART_TIME"
            ? "Part-time"
            : v === "CONTRACT"
                ? "Contract"
                : v === "INTERNSHIP"
                    ? "Internship"
                    : v === "FREELANCE"
                        ? "Freelance"
                        : v;
}

function prettyExperience(v?: string) {
    if (!v) return "Experience";
    return v === "JUNIOR"
        ? "Junior"
        : v === "INTERMEDIATE"
            ? "Intermediate"
            : v === "SENIOR"
                ? "Senior"
                : v === "LEAD"
                    ? "Lead"
                    : v === "EXECUTIVE"
                        ? "Executive"
                        : v;
}

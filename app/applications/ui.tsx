"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Application, ApplicationStatus } from "@/types/application";
import { listApplications, updateApplicationStatus } from "@/lib/api/applications";

function label(v?: string | null) {
    if (v === null || v === undefined) return "—";
    const s = String(v).trim();
    return s.length ? s : "—";
}

function chip(status: string) {
    const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
    if (status === "PENDING") return `${base} bg-amber-100 text-amber-900`;
    if (status === "REVIEWED") return `${base} bg-blue-100 text-blue-900`;
    if (status === "SHORTLISTED") return `${base} bg-violet-100 text-violet-900`;
    if (status === "ACCEPTED") return `${base} bg-emerald-100 text-emerald-900`;
    if (status === "REJECTED") return `${base} bg-red-100 text-red-900`;
    return `${base} bg-slate-100 text-slate-900`;
}

function fmtDate(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

const STATUS_OPTIONS: ApplicationStatus[] = [
    "PENDING",
    "REVIEWED",
    "SHORTLISTED",
    "ACCEPTED",
    "REJECTED",
];

export default function EmployerApplicationsClient() {
    const { isAuthenticated, loading: authLoading, user } = useAuth();
    const router = useRouter();

    const [items, setItems] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const isEmployer = user?.role === "EMPLOYER";

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        let mounted = true;

        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const data = await listApplications(); // backend should return employer-owned apps
                if (mounted) setItems(Array.isArray(data) ? data : []);
            } catch (e: any) {
                const msg =
                    e?.response?.data?.detail ||
                    (typeof e?.response?.data === "object" ? JSON.stringify(e.response.data) : null) ||
                    e?.message ||
                    "Failed to load applications";
                if (mounted) setErr(msg);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [authLoading, isAuthenticated, router]);

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => {
            const da = new Date(a.applied_at ?? a.created_at).getTime();
            const db = new Date(b.applied_at ?? b.created_at).getTime();
            return db - da;
        });
    }, [items]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-600">Loading applications...</p>
                </div>
            </div>
        );
    }

    if (!isEmployer) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">This page is for employers only.</p>
                    <Link href="/" className="mt-3 inline-flex text-sm text-emerald-700 hover:underline">
                        ← Back
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/" className="text-sm font-medium text-emerald-800 hover:underline">
                        ← Back to dashboard
                    </Link>
                    <h1 className="text-xl font-semibold text-slate-900">Applications</h1>
                </div>

                {err ? <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">{err}</div> : null}

                {sorted.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-700">No applications yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sorted.map((a) => (
                            <EmployerApplicationCard
                                key={a.id}
                                app={a}
                                onUpdated={(updated) => {
                                    setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function EmployerApplicationCard({
    app,
    onUpdated,
}: {
    app: Application;
    onUpdated: (a: Application) => void;
}) {
    const [saving, setSaving] = useState(false);
    const [notes, setNotes] = useState(app.notes ?? "");
    const [status, setStatus] = useState<ApplicationStatus>(app.status);

    const candidateName = useMemo(() => {
        const u = app.candidate?.user;
        if (!u) return "—";
        return [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email;
    }, [app]);

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <Link href={`/applications/${app.id}`} className="text-lg font-semibold text-slate-900 hover:underline">
                        {label(app.job?.title)}
                    </Link>
                    <p className="mt-1 text-sm text-slate-600">{label(app.job?.company)}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className={chip(app.status)}>{app.status}</span>
                        {app.is_withdrawn ? (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-900">
                                Withdrawn
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-3 text-sm text-slate-700">
                        <span className="text-slate-500">Candidate:</span> {candidateName}
                    </div>

                    <div className="mt-1 text-sm text-slate-700">
                        <span className="text-slate-500">Applied:</span> {fmtDate(app.applied_at ?? app.created_at)}
                    </div>
                </div>

                <div className="w-full sm:w-[360px]">
                    <label className="text-xs font-medium text-slate-600">Update status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>

                    <label className="mt-4 block text-xs font-medium text-slate-600">Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                        placeholder="Good candidate, schedule interview..."
                    />

                    <button
                        disabled={saving}
                        onClick={async () => {
                            setSaving(true);
                            try {
                                const updated = await updateApplicationStatus(app.id, {
                                    status,
                                    notes: notes.trim() ? notes.trim() : undefined,
                                });
                                onUpdated(updated);
                            } finally {
                                setSaving(false);
                            }
                        }}
                        className="mt-3 w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

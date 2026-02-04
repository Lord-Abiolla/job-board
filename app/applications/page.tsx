"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Application } from "@/types/application";
import { listMyApplications } from "@/lib/api/applications";

function label(v?: string | null) {
    if (v === null || v === undefined) return "—";
    const s = String(v).trim();
    return s.length ? s : "—";
}

function chip(status: string) {
    const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
    if (status === "PENDING") return `${base} bg-amber-100 text-amber-900`;
    if (status === "REVIEWED") return `${base} bg-blue-100 text-blue-900`;
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

function fmtMoney(n?: number | null) {
    if (n === null || n === undefined) return "—";
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

export default function ApplicationsPage() {
    const { isAuthenticated, loading: authLoading, user } = useAuth();
    const router = useRouter();

    const [items, setItems] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const isCandidate = user?.role === "CANDIDATE";

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
                const data = await listMyApplications();
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
                <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-600">Loading applications...</p>
                </div>
            </div>
        );
    }

    if (!isCandidate) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">Applications are available for candidates only.</p>
                    <Link href="/" className="mt-3 inline-flex text-sm text-emerald-700 hover:underline">
                        ← Back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href="/" className="text-sm font-medium text-emerald-800 hover:underline">
                        ← Back to jobs
                    </Link>

                    <h1 className="text-xl font-semibold text-slate-900">My Applications</h1>
                </div>

                {err ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
                        {err}
                    </div>
                ) : null}

                {sorted.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-700">You haven’t applied for any jobs yet.</p>
                        <Link href="/" className="mt-3 inline-flex text-sm text-emerald-700 hover:underline">
                            Browse jobs →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sorted.map((a) => (
                            <div
                                key={a.id}
                                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <Link
                                            href={`/applications/${a.id}`}
                                            className="text-lg font-semibold text-slate-900 hover:underline"
                                        >
                                            {label(a.job?.title)}
                                        </Link>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {label(a.job?.company)}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className={chip(a.status)}>{a.status}</span>
                                            {a.is_withdrawn ? (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-900">
                                                    Withdrawn
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="text-sm text-slate-700 sm:text-right">
                                        <div>
                                            <span className="text-slate-500">Applied:</span> {fmtDate(a.applied_at ?? a.created_at)}
                                        </div>
                                        <div className="mt-1">
                                            <span className="text-slate-500">Reviewed:</span> {fmtDate(a.reviewed_at)}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <Info label="Expected salary" value={a.expected_salary != null ? fmtMoney(a.expected_salary) : "—"} />
                                    <Info label="Available from" value={a.available_from ?? "—"} />
                                    <Info label="Resume" value={a.resume ? "Uploaded" : "—"} />
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs font-medium text-slate-600">Cover letter</p>
                                    <p className="mt-1 whitespace-pre-line text-sm text-slate-800">
                                        {label(a.cover_letter)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-600">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}

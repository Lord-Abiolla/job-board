"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Application } from "@/types/application";
import { listApplications } from "@/lib/api/applications";

function chip(status: string) {
    const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
    if (status === "PENDING") return `${base} bg-amber-100 text-amber-900`;
    if (status === "REVIEWED") return `${base} bg-blue-100 text-blue-900`;
    if (status === "SHORTLISTED") return `${base} bg-violet-100 text-violet-900`;
    if (status === "ACCEPTED") return `${base} bg-emerald-100 text-emerald-900`;
    if (status === "REJECTED") return `${base} bg-red-100 text-red-900`;
    return `${base} bg-slate-100 text-slate-900`;
}

function label(v?: string | null) {
    if (v === null || v === undefined) return "—";
    const s = String(v).trim();
    return s.length ? s : "—";
}

function fmtDate(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
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

        if (!isCandidate) {
            router.push("/");
            return;
        }

        let mounted = true;

        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const data = await listApplications();
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
    }, [authLoading, isAuthenticated, isCandidate, router]);

    const rows = useMemo(() => {
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

    if (err) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-5xl rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
                    {err}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/" className="text-sm font-medium text-emerald-800 hover:underline">
                        ← Back to jobs
                    </Link>
                    <h1 className="text-xl font-semibold text-slate-900">Applications</h1>
                </div>

                {rows.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-700">You haven’t applied for any jobs yet.</p>
                        <Link href="/" className="mt-3 inline-flex text-sm text-emerald-700 hover:underline">
                            Browse jobs →
                        </Link>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-600">
                            <div className="col-span-6">Job</div>
                            <div className="col-span-3">Company</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-1 text-right">Applied</div>
                        </div>

                        {rows.map((a) => (
                            <div
                                key={a.id}
                                className="grid grid-cols-12 gap-4 px-6 py-4 border-t border-slate-100"
                            >
                                <div className="col-span-6 min-w-0">
                                    <Link
                                        href={`/applications/${a.id}`} // optional details page
                                        className="truncate text-sm font-semibold text-slate-900 hover:underline"
                                    >
                                        {label(a.job?.title)}
                                    </Link>
                                </div>

                                <div className="col-span-3 min-w-0">
                                    <p className="truncate text-sm text-slate-700">{label(a.job?.company)}</p>
                                </div>

                                <div className="col-span-2">
                                    <span className={chip(a.status)}>{a.status}</span>
                                </div>

                                <div className="col-span-1 text-right text-sm text-slate-700">
                                    {fmtDate(a.applied_at ?? a.created_at)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

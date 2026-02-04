"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Application } from "@/types/application";
import { getApplicationById } from "@/lib/api/applications";

function label(v?: string | null) {
    if (v === null || v === undefined) return "—";
    const s = String(v).trim();
    return s.length ? s : "—";
}

function fmtDate(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

export default function ApplicationDetailPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [app, setApp] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

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
                const data = await getApplicationById(id);
                if (mounted) setApp(data);
            } catch (e: any) {
                const msg =
                    e?.response?.data?.detail ||
                    (typeof e?.response?.data === "object" ? JSON.stringify(e.response.data) : null) ||
                    e?.message ||
                    "Failed to load application";
                if (mounted) setErr(msg);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [authLoading, isAuthenticated, router, id]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-600">Loading application...</p>
                </div>
            </div>
        );
    }

    if (err || !app) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">{err ?? "Application not found."}</p>
                    <Link href="/applications" className="mt-3 inline-flex text-sm text-emerald-700 hover:underline">
                        ← Back to applications
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href="/applications" className="text-sm font-medium text-emerald-800 hover:underline">
                        ← Back to applications
                    </Link>
                    <h1 className="text-xl font-semibold text-slate-900">Application #{app.id}</h1>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-5">
                    <div>
                        <p className="text-xs font-medium text-slate-600">Job</p>
                        <p className="text-sm font-semibold text-slate-900">
                            {label(app.job?.title)} • {label(app.job?.company)} (ID: {app.job?.id ?? "—"})
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Info label="Status" value={label(app.status)} />
                        <Info label="Withdrawn" value={app.is_withdrawn ? "Yes" : "No"} />
                        <Info label="Applied at" value={fmtDate(app.applied_at ?? app.created_at)} />
                        <Info label="Reviewed at" value={fmtDate(app.reviewed_at)} />
                        <Info label="Expected salary" value={app.expected_salary != null ? String(app.expected_salary) : "—"} />
                        <Info label="Available from" value={app.available_from ?? "—"} />
                        <Info label="Resume" value={app.resume ? "Uploaded" : "—"} />
                    </div>

                    <div>
                        <p className="text-xs font-medium text-slate-600">Cover letter</p>
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{label(app.cover_letter)}</p>
                    </div>

                    {app.resume ? (
                        <a
                            href={app.resume}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex text-sm font-medium text-emerald-800 hover:underline"
                        >
                            View resume →
                        </a>
                    ) : null}
                </div>
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

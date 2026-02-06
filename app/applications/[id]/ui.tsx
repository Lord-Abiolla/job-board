"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Application } from "@/types/application";
import { getApplication } from "@/lib/api/applications";

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

export default function ApplicationDetailClient() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();

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
                const data = await getApplication(id);
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

    const candidateName = useMemo(() => {
        const u = app?.candidate?.user;
        if (!u) return "—";
        return [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email;
    }, [app]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-600">Loading application...</p>
                </div>
            </div>
        );
    }

    if (err || !app) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/applications" className="text-sm font-medium text-emerald-800 hover:underline">
                        ← Back
                    </Link>
                    <span className={chip(app.status)}>{app.status}</span>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-semibold text-slate-900">{label(app.job?.title)}</h1>
                    <p className="mt-1 text-sm text-slate-600">{label(app.job?.company)}</p>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Info label="Applied" value={fmtDate(app.applied_at ?? app.created_at)} />
                        <Info label="Reviewed" value={fmtDate(app.reviewed_at)} />
                        <Info label="Withdrawn" value={app.is_withdrawn ? "Yes" : "No"} />
                    </div>

                    {app.candidate ? (
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-medium text-slate-600">Candidate</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{candidateName}</p>
                            <p className="mt-1 text-sm text-slate-700">{label(app.candidate.headline ?? null)}</p>
                        </div>
                    ) : null}

                    <div className="mt-6">
                        <p className="text-xs font-medium text-slate-600">Cover letter</p>
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{label(app.cover_letter)}</p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Info label="Expected salary" value={app.expected_salary == null ? "—" : String(app.expected_salary)} />
                        <Info label="Available from" value={app.available_from ?? "—"} />
                        <Info label="Resume" value={app.resume ? "Uploaded" : "—"} />
                    </div>

                    {app.resume ? (
                        <a
                            href={app.resume}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:underline"
                        >
                            View resume →
                        </a>
                    ) : null}

                    {app.notes ? (
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-medium text-slate-600">Employer notes</p>
                            <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{app.notes}</p>
                        </div>
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

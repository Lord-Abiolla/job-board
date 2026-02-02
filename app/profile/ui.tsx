"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile } from "@/types/profile";
import { getMyProfile } from "@/lib/api/profile";

function label(v?: string | null) {
    if (!v) return "—";
    return v;
}

function chip(kind: "solid" | "soft" = "soft") {
    return kind === "solid"
        ? "inline-flex items-center rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white"
        : "inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900";
}

export default function ProfileClient() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        let mounted = true;

        (async () => {
            setLoading(true);
            try {
                const data = await getMyProfile();
                if (mounted) setProfile(data);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [isAuthenticated, authLoading, router]);

    const account = profile?.user ?? profile;

    const name = useMemo(() => {
        const f = account?.first_name?.trim();
        const l = account?.last_name?.trim();
        return [f, l].filter(Boolean).join(" ") || account?.email || "";
    }, [account]);


    const role = account?.role;

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">Profile not found.</p>
                    <Link href="/" className="mt-3 inline-flex text-sm text-emerald-700 hover:underline">
                        ← Back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const completion = profile.profile_completion ?? profile.completion ?? 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href="/" className="text-sm font-medium text-emerald-800 hover:underline">
                        ← Back to dashboard
                    </Link>

                    <Link
                        href="/profile/edit"
                        className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                        ✏️ Edit Profile
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left summary */}
                    <div className="lg:col-span-1">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-slate-900 text-white">
                                    {profile.profile_picture ? (
                                        <img src={profile.profile_picture} alt={name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-semibold">{name?.charAt(0)?.toUpperCase() || "U"}</span>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h1 className="truncate text-lg font-semibold text-slate-900">{name}</h1>
                                    <p className="truncate text-sm text-slate-600">{account?.email ?? "—"}</p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {role && <span className={chip("solid")}>{role === "CANDIDATE" ? "Candidate" : "Employer"}</span>}
                                        {profile.is_verified || profile.verified ? (
                                            <span className={chip()}>✔ Verified</span>
                                        ) : (
                                            <span className={chip()}>Not verified</span>
                                        )}
                                        <span className={chip()}>{completion}% complete</span>
                                    </div>
                                </div>
                            </div>

                            {profile.headline && (
                                <p className="mt-5 text-sm font-medium text-slate-900">{profile.headline}</p>
                            )}

                            {profile.about && (
                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{profile.about}</p>
                            )}
                        </div>
                    </div>

                    {/* Right details */}
                    <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="text-sm font-semibold text-slate-900">Profile details</h2>

                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Info label="First name" value={account?.first_name} />
                                <Info label="Last name" value={account?.last_name} />
                                <Info label="Phone" value={profile.phone} />
                                <Info label="Gender" value={profile.gender} />
                                <Info label="Date of birth" value={profile.date_of_birth} />
                                <Info label="Website" value={profile.website} />
                                <Info label="LinkedIn" value={profile.linkedin} />
                                <Info label="GitHub" value={profile.github} />
                                <Info label="Twitter" value={profile.twitter} />
                                <Info label="Resume" value={profile.resume ? "Uploaded" : "—"} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Info({ label: lbl, value }: { label: string; value?: string | null }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-600">{lbl}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{label(value)}</p>
        </div>
    );
}

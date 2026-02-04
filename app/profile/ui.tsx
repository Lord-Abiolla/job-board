"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile } from "@/types/profile";
import { getMyProfile } from "@/lib/api/profile";

function label(v?: string | null) {
    if (v === null || v === undefined) return "—";
    const s = String(v).trim();
    return s.length ? s : "—";
}

function chip(kind: "solid" | "soft" = "soft") {
    return kind === "solid"
        ? "inline-flex items-center rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white"
        : "inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900";
}

function safeSplitName(full: string) {
    const s = (full ?? "").trim();
    if (!s) return { first_name: "", last_name: "" };
    const parts = s.split(/\s+/);
    return { first_name: parts[0] || "", last_name: parts.slice(1).join(" ") };
}

type NormalizedAccount = {
    email: string;
    first_name: string;
    last_name: string;
    role: "CANDIDATE" | "EMPLOYER";
};

type NormalizedProfile = UserProfile & {
    __account: NormalizedAccount;
    __kind: "candidate" | "employer";
    __avatar: string | null;
    __resume: string | null;
    __social: {
        website: string | null;
        linkedin: string | null;
        github: string | null;
        twitter: string | null;
    };
};

/**
 * Data shape from docs: { user: { email, first_name, last_name, role }, profile_picture, resume, linkedin, ... }
 */
function normalizeProfile(raw: any): NormalizedProfile {
    if (raw?.user && typeof raw.user === "object") {
        const role: "CANDIDATE" | "EMPLOYER" | "ADMIN" =
            raw.user.role === "EMPLOYER" ? "EMPLOYER" : "CANDIDATE";

        return {
            ...raw,
            __account: {
                email: raw.user.email ?? "",
                first_name: raw.user.first_name ?? "",
                last_name: raw.user.last_name ?? "",
                role,
            },
            __kind: role === "EMPLOYER" ? "employer" : "candidate",
            __avatar: raw.profile_picture ?? raw.company_logo_url ?? null,
            __resume: raw.resume ?? null,
            __social: {
                website: raw.website ?? null,
                linkedin: raw.linkedin ?? null,
                github: raw.github ?? null,
                twitter: raw.twitter ?? null,
            },
        } as NormalizedProfile;
    }

    const { first_name, last_name } = safeSplitName(raw?.name ?? "");
    return {
        ...raw,
        __account: {
            email: raw?.email ?? "",
            first_name,
            last_name,
            role: raw?.role ?? "CANDIDATE",
        },
        __kind: "candidate",
        __avatar: raw?.picture ?? null,
        __resume: raw?.resume_url ?? null,
        __social: {
            website: raw?.social_links?.website ?? null,
            linkedin: raw?.social_links?.linkedin ?? null,
            github: raw?.social_links?.github ?? null,
            twitter: raw?.social_links?.twitter ?? null,
        },
    } as NormalizedProfile;
}

export default function ProfileClient() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<NormalizedProfile | null>(null);
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
                console.log("RESPONSE DATA:", data);

                const normalized = normalizeProfile(data);
                if (mounted) setProfile(normalized);
            } catch (e) {
                console.error("Failed to load profile:", e);
                if (mounted) setProfile(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [isAuthenticated, authLoading, router]);

    const kind = profile?.__kind ?? null;
    const account = profile?.__account ?? null;

    const completion =
        (profile as any)?.profile_completion ??
        (profile as any)?.completion ??
        0;

    const isVerified = Boolean(
        (profile as any)?.is_verified ?? (profile as any)?.verified
    );

    const avatarUrl = profile?.__avatar ?? null;
    const social = profile?.__social ?? {
        website: null,
        linkedin: null,
        github: null,
        twitter: null,
    };
    const resume = profile?.__resume ?? null;

    const name = useMemo(() => {
        const f = account?.first_name?.trim();
        const l = account?.last_name?.trim();
        const full = [f, l].filter(Boolean).join(" ");
        return full || account?.email || "—";
    }, [account]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile || !account || !kind) {
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

    const candidate = kind === "candidate" ? (profile as any) : null;
    const employer = kind === "employer" ? (profile as any) : null;

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
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-semibold">
                                            {name?.charAt(0)?.toUpperCase() || "U"}
                                        </span>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h1 className="truncate text-lg font-semibold text-slate-900">{name}</h1>
                                    <p className="truncate text-sm text-slate-600">{label(account.email)}</p>
                                </div>
                            </div>

                            {/* Candidate headline/about */}
                            {candidate?.headline && (
                                <p className="mt-5 text-sm font-medium text-slate-900">{candidate.headline}</p>
                            )}

                            {candidate?.about && (
                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                                    {candidate.about}
                                </p>
                            )}

                            {/* Employer summary */}
                            {employer?.description && (
                                <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-700">
                                    {employer.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right details */}
                    <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-semibold text-slate-900">Profile details</h2>

                                <div className="flex flex-wrap gap-2">
                                    <span className={chip("solid")}>
                                        {account.role === "CANDIDATE" ? "Candidate" : "Employer"}
                                    </span>
                                    {isVerified ? (
                                        <span className={chip()}>✔ Verified</span>
                                    ) : (
                                        <span className={chip()}>verified</span>
                                    )}
                                    <span className={chip()}>{completion}% complete</span>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Info label="First name" value={account.first_name} />
                                <Info label="Last name" value={account.last_name} />

                                {kind === "candidate" ? (
                                    <>
                                        <Info label="Phone" value={candidate?.phone ?? null} />
                                        <Info label="Gender" value={candidate?.gender ?? null} />
                                        <Info label="Date of birth" value={candidate?.date_of_birth ?? null} />

                                        <Info label="Website" value={social.website} />
                                        <Info label="LinkedIn" value={social.linkedin} />
                                        <Info label="GitHub" value={social.github} />
                                        <Info label="Twitter" value={social.twitter} />

                                        <Info label="Resume" value={resume ? "Uploaded" : null} />
                                    </>
                                ) : (
                                    <>
                                        <Info label="Company name" value={employer?.company_name ?? null} />
                                        <Info label="Industry" value={employer?.industry ?? null} />
                                        <Info label="City" value={employer?.city ?? null} />
                                        <Info label="Country" value={employer?.country ?? null} />

                                        <Info label="LinkedIn" value={employer?.linkedin_url ?? null} />
                                        <Info label="Website" value={employer?.website_url ?? null} />
                                        <Info label="Company description" value={employer?.description ?? null} />
                                    </>
                                )}
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

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyProfile } from "@/lib/api/profile";
import type {
    CandidateProfile,
    CandidateProfileFlat,
    EmployerProfile,
    ProfileResponse,
} from "@/types/profile";

import { isCandidateProfile, isEmployerProfile } from "@/types/profile";

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

function candidateEmail(c: CandidateProfile | CandidateProfileFlat | null) {
    return (c as any)?.user?.email ?? (c as any)?.email ?? null;
}

function candidateName(c: CandidateProfile | CandidateProfileFlat | null) {
    const user = (c as any)?.user;
    if (user) {
        const f = String(user.first_name ?? "").trim();
        const l = String(user.last_name ?? "").trim();
        return [f, l].filter(Boolean).join(" ") || user.email || "—";
    }
    const name = String((c as any)?.name ?? "").trim();
    return name || (c as any)?.email || "—";
}

function candidateAvatar(c: CandidateProfile | CandidateProfileFlat | null) {
    return (c as any)?.profile_picture ?? (c as any)?.picture ?? null;
}

function candidateSocial(c: CandidateProfile | CandidateProfileFlat | null) {
    // nested candidate
    if ((c as any)?.user) {
        return {
            website: (c as any)?.website ?? null,
            linkedin: (c as any)?.linkedin ?? null,
            github: (c as any)?.github ?? null,
            twitter: (c as any)?.twitter ?? null,
        };
    }
    // flat candidate
    const sl = (c as any)?.social_links ?? {};
    return {
        website: sl.website ?? null,
        linkedin: sl.linkedin ?? null,
        github: sl.github ?? null,
        twitter: sl.twitter ?? null,
    };
}

function candidateResumeStatus(c: CandidateProfile | CandidateProfileFlat | null) {
    return (c as any)?.resume ?? (c as any)?.resume_url ?? null;
}


export default function ProfileClient() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [candidate, setCandidate] = useState<(CandidateProfile | CandidateProfileFlat) | null>(null);
    const [employer, setEmployer] = useState<EmployerProfile | null>(null);
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
                const data: ProfileResponse = await getMyProfile();
                console.log("RESPONSE DATA:", data);

                if (!mounted) return;

                if (isCandidateProfile(data)) {
                    setCandidate(data);
                    setEmployer(null);
                } else if (isEmployerProfile(data)) {
                    setEmployer(data);
                    setCandidate(null);
                } else {
                    // Unknown shape
                    setCandidate(null);
                    setEmployer(null);
                }
            } catch (e) {
                console.error("Failed to load profile:", e);
                if (!mounted) return;
                setCandidate(null);
                setEmployer(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [isAuthenticated, authLoading, router]);

    const kind: "candidate" | "employer" | null = candidate ? "candidate" : employer ? "employer" : null;

    const email = candidate ? candidateEmail(candidate) : employer?.email ?? null;

    const name = useMemo(() => {
        if (candidate) return candidateName(candidate);
        if (employer) return employer.name?.trim() || employer.email || "—";
        return "—";
    }, [candidate, employer]);


    const avatarUrl = candidate ? candidateAvatar(candidate) : employer?.company_logo_url ?? null;

    const isVerified = Boolean(
        candidate?.is_verified ??
        candidate?.verified ??
        employer?.is_verified ??
        employer?.verified
    );

    const completion =
        candidate?.profile_completion ??
        candidate?.completion ??
        employer?.profile_completion ??
        employer?.completion ??
        0;

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!kind) {
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
                                        <span className="text-lg font-semibold">{name?.charAt(0)?.toUpperCase() || "U"}</span>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h1 className="truncate text-lg font-semibold text-slate-900">{name}</h1>
                                    <p className="truncate text-sm text-slate-600">{label(email)}</p>
                                </div>
                            </div>

                            {/* Candidate summary */}
                            {kind === "candidate" && candidate?.headline && (
                                <p className="mt-5 text-sm font-medium text-slate-900">{candidate.headline}</p>
                            )}

                            {kind === "candidate" && candidate?.about && (
                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{candidate.about}</p>
                            )}

                            {kind === "employer" && employer?.description && (
                                <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-700">{employer.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Right details */}
                    <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-semibold text-slate-900">Profile details</h2>

                                <div className="flex flex-wrap gap-2">
                                    <span className={chip("solid")}>{kind === "candidate" ? "Candidate" : "Employer"}</span>
                                    <span className={chip()}>{isVerified ? "✔ Verified" : "Not verified"}</span>
                                    <span className={chip()}>{completion}% complete</span>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Names: candidate has first/last; employer often only has full `name` */}
                                {kind === "candidate" ? (
                                    <>
                                        <Info label="First name" value={(candidate as any)?.user?.first_name ?? null} />
                                        <Info label="Last name" value={(candidate as any)?.user?.last_name ?? null} />
                                        {!((candidate as any)?.user) && <Info label="Name" value={(candidate as any)?.name ?? null} />}
                                    </>
                                ) : (
                                    <>
                                        <Info label="Name" value={employer?.name ?? null} />
                                        <Info label="Email" value={employer?.email ?? null} />
                                    </>
                                )}

                                {kind === "candidate" ? (
                                    <>
                                        <Info label="Phone" value={candidate?.phone ?? null} />
                                        <Info label="Gender" value={candidate?.gender ?? null} />
                                        <Info label="Date of birth" value={candidate?.date_of_birth ?? null} />

                                        {(() => {
                                            const s = candidateSocial(candidate);
                                            const hasResume = !!candidateResumeStatus(candidate);
                                            return (
                                                <>
                                                    <Info label="Website" value={s.website} />
                                                    <Info label="LinkedIn" value={s.linkedin} />
                                                    <Info label="GitHub" value={s.github} />
                                                    <Info label="Twitter" value={s.twitter} />
                                                    <Info label="Resume" value={hasResume ? "Uploaded" : null} />
                                                </>
                                            );
                                        })()}

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

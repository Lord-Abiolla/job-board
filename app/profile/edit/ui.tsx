"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { getMyProfile, updateCandidateProfile, updateEmployerProfile } from "@/lib/api/profile";
import type {
    CandidateProfile,
    CandidateProfileFlat,
    EmployerProfile,
    ProfileResponse,
} from "@/types/profile";
import { isCandidateProfile, isEmployerProfile } from "@/types/profile";
import CandidateProfileForm from "@/components/profile/CandidateProfileForm";
import EmployerProfileForm from "@/components/profile/EmployerProfileForm";

function normalizeCandidateProfile(input: CandidateProfile | CandidateProfileFlat): CandidateProfile {
    if ("user" in input) {
        // Already the nested candidate shape
        return input;
    }

    const name = (input.name ?? "").trim();
    const [firstName, ...rest] = name.split(" ");
    const lastName = rest.join(" ").trim();

    return {
        id: input.id,
        user: {
            id: input.id,
            email: input.email,
            first_name: firstName || input.email,
            last_name: lastName,
            role: "CANDIDATE",
        },
        phone: input.phone,
        gender: input.gender,
        date_of_birth: input.date_of_birth,
        headline: input.headline,
        about: input.about,
        linkedin: input.social_links?.linkedin ?? null,
        github: input.social_links?.github ?? null,
        twitter: input.social_links?.twitter ?? null,
        website: input.social_links?.website ?? null,
        profile_picture: input.picture ?? null,
        resume: input.resume_url ?? null,
        is_verified: input.is_verified,
        verified: input.verified,
        profile_completion: input.profile_completion,
        completion: input.completion,
    };
}

// ---- helpers from above ----
function buildCandidateForm(payload: any) {
    const form = new FormData();
    if (payload.first_name !== undefined) form.append("first_name", payload.first_name);
    if (payload.last_name !== undefined) form.append("last_name", payload.last_name);
    if (payload.phone !== undefined) form.append("phone", payload.phone);
    if (payload.gender !== undefined) form.append("gender", payload.gender);
    if (payload.date_of_birth !== undefined) form.append("date_of_birth", payload.date_of_birth);
    if (payload.headline !== undefined) form.append("headline", payload.headline);
    if (payload.about !== undefined) form.append("about", payload.about);
    if (payload.website !== undefined) form.append("website", payload.website);
    if (payload.linkedin !== undefined) form.append("linkedin", payload.linkedin);
    if (payload.github !== undefined) form.append("github", payload.github);
    if (payload.twitter !== undefined) form.append("twitter", payload.twitter);
    if (payload.profile_picture) form.append("profile_picture", payload.profile_picture);
    if (payload.resume) form.append("resume", payload.resume);
    return form;
}

function buildEmployerForm(payload: any) {
    const form = new FormData();
    if (payload.name !== undefined) form.append("name", payload.name);
    if (payload.company_name !== undefined) form.append("company_name", payload.company_name);
    if (payload.industry !== undefined) form.append("industry", payload.industry);
    if (payload.city !== undefined) form.append("city", payload.city);
    if (payload.country !== undefined) form.append("country", payload.country);
    if (payload.description !== undefined) form.append("description", payload.description);
    if (payload.website_url !== undefined) form.append("website_url", payload.website_url);
    if (payload.linkedin_url !== undefined) form.append("linkedin_url", payload.linkedin_url);
    if (payload.company_logo_url) form.append("company_logo_url", payload.company_logo_url);
    return form;
}

export default function ProfileEditClient() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
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
                if (!mounted) return;

                if (isCandidateProfile(data)) {
                    const normalized = normalizeCandidateProfile(data);
                    setCandidate(normalized);
                    setEmployer(null);
                } else if (isEmployerProfile(data)) {
                    setEmployer(data);
                    setCandidate(null);
                } else {
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

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-sm text-slate-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!candidate && !employer) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">Profile not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
            <div className="mx-auto max-w-3xl">
                {candidate ? (
                    <CandidateProfileForm
                        initial={candidate}
                        onSubmit={async (payload) => {
                            const form = buildCandidateForm(payload);
                            const updated = await updateCandidateProfile(form);
                            setCandidate(updated);
                            router.push("/profile");
                        }}
                    />
                ) : (
                    <EmployerProfileForm
                        initial={employer!}
                        onSubmit={async (payload) => {
                            const form = buildEmployerForm(payload);
                            const updated = await updateEmployerProfile(form);
                            setEmployer(updated);
                            router.push("/profile");
                        }}
                    />
                )}
            </div>
        </div>
    );
}

import type { UserRole } from "@/types/user";

export type CandidateProfile = {
    id: number;
    user: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        role: UserRole;
    };
    phone?: string | null;
    gender?: string | null;
    date_of_birth?: string | null;
    headline?: string | null;
    about?: string | null;
    linkedin?: string | null;
    github?: string | null;
    twitter?: string | null;
    website?: string | null;
    profile_picture?: string | null;
    resume?: string | null;
    is_verified?: boolean;
    verified?: boolean;
    profile_completion?: number;
    completion?: number;
};

export type EmployerProfile = {
    id: number;
    email: string;
    name?: string | null;
    company_name?: string | null;
    industry?: string | null;
    description?: string | null;
    city?: string | null;
    country?: string | null;
    website_url?: string | null;
    linkedin_url?: string | null;
    company_logo_url?: string | null;
    is_verified?: boolean;
    verified?: boolean;
    profile_completion?: number;
    completion?: number;
};

export type CandidateProfileFlat = {
    id: number;
    email: string;
    name?: string | null;

    phone?: string | null;
    gender?: string | null;
    date_of_birth?: string | null;
    headline?: string | null;
    about?: string | null;

    social_links?: {
        linkedin?: string | null;
        github?: string | null;
        twitter?: string | null;
        website?: string | null;
    } | null;

    picture?: string | null;
    resume_url?: string | null;

    is_verified?: boolean;
    verified?: boolean;
    profile_completion?: number;
    completion?: number;
};


export type ProfileResponse = CandidateProfile | CandidateProfileFlat | EmployerProfile;

function isObj(p: any): p is Record<string, any> {
    return !!p && typeof p === "object";
}

export function isCandidateProfile(p: any): p is CandidateProfile | CandidateProfileFlat {
    if (!isObj(p)) return false;

    // nested candidate (docs screenshot)
    if (isObj(p.user)) return true;

    // flat candidate (your console screenshot)
    const hasCandidateSignals =
        "headline" in p ||
        "about" in p ||
        "gender" in p ||
        "date_of_birth" in p ||
        "social_links" in p ||
        "resume_url" in p ||
        "picture" in p ||
        "skills" in p; // if your backend returns skills list

    const hasEmployerSignals =
        "company_name" in p ||
        "industry" in p ||
        "website_url" in p ||
        "linkedin_url" in p ||
        "company_logo_url" in p;

    return hasCandidateSignals && !hasEmployerSignals;
}

export function isEmployerProfile(p: any): p is EmployerProfile {
    if (!isObj(p)) return false;

    // employer should not have nested user
    if ("user" in p) return false;

    const hasEmployerSignals =
        "company_name" in p ||
        "industry" in p ||
        "website_url" in p ||
        "linkedin_url" in p ||
        "company_logo_url" in p;

    const hasCandidateSignals =
        "headline" in p ||
        "about" in p ||
        "gender" in p ||
        "date_of_birth" in p ||
        "social_links" in p ||
        "resume_url" in p ||
        "picture" in p ||
        "skills" in p;

    return hasEmployerSignals && !hasCandidateSignals;
}

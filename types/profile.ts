import type { UserRole } from "@/types/user";

export type UserAccount = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
};

export type CandidateProfile = {
    id: number;
    user: UserAccount;

    phone: string | null;
    gender: string | null;
    date_of_birth: string | null;

    headline: string | null;
    about: string | null;

    linkedin: string | null;
    github: string | null;
    twitter: string | null;
    website: string | null;

    profile_picture: string | null;
    resume: string | null;

    is_verified: boolean;
    verified?: boolean;
    profile_completion: number;

    is_profile_complete?: boolean;

    candidate_skills?: any[];
    education?: any[];
    certifications?: any[];

    created_at?: string;
    updated_at?: string;
};

export type EmployerProfile = {
    id: number;
    user: UserAccount;

    company_name: string | null;
    industry: string | null;
    city: string | null;
    country: string | null;

    linkedin_url: string | null;
    website_url: string | null;
    description: string | null;

    company_logo_url: string | null;

    is_verified: boolean;
    verified?: boolean;
    profile_completion: number;

    created_at?: string;
    updated_at?: string;
};

export type UserProfile = CandidateProfile | EmployerProfile;

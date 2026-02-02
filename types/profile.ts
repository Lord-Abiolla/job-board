import type { UserRole } from "@/types/user";

export type ProfileUser = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
};

export type BaseProfile = {
    id: number;
    user: ProfileUser;

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

    completion?: number;
    profile_completion?: number;

    is_profile_complete?: boolean;

    created_at?: string;
    updated_at?: string;
};

export type UserProfile = BaseProfile & Record<string, any>;

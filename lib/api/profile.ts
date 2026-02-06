import { apiClient } from "@/lib/api/client";
import type { ProfileResponse } from "@/types/profile";
import { CandidateProfile, EmployerProfile } from "@/types/profile";

export async function getMyProfile(): Promise<ProfileResponse> {
    const res = await apiClient.get<ProfileResponse>("/auth/profile/");
    return res.data;
}

// Candidate-specific update
export async function updateCandidateProfile(form: FormData): Promise<CandidateProfile> {
    const res = await apiClient.patch<CandidateProfile>("/auth/update_profile/", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

// Employer-specific update
export async function updateEmployerProfile(form: FormData): Promise<EmployerProfile> {
    const res = await apiClient.patch<EmployerProfile>("/auth/update_profile/", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

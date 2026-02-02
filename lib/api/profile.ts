import { apiClient } from "@/lib/api/client";
import type { UserProfile } from "@/types/profile";

export async function getMyProfile(): Promise<UserProfile> {
    const res = await apiClient.get<UserProfile>("/auth/profile/");
    return res.data;
}

export async function updateMyProfile(form: FormData): Promise<UserProfile> {
    const res = await apiClient.patch<UserProfile>("/auth/update_profile/", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

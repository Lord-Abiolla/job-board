import { apiClient } from "./client";
import type { Application, ApplicationStatus } from "@/types/application";

export type ApplyPayload = {
    cover_letter: string;
    resume?: File | null;
    expected_salary?: string | number | null;
    available_from?: string | null;
};

export async function applyToJob(
    jobId: string | number,
    payload: ApplyPayload
) {
    const form = new FormData();

    form.append("cover_letter", payload.cover_letter);

    if (payload.resume) {
        form.append("resume", payload.resume);
    }

    if (
        payload.expected_salary !== null &&
        payload.expected_salary !== undefined &&
        String(payload.expected_salary).trim() !== ""
    ) {
        form.append("expected_salary", String(payload.expected_salary));
    }

    if (payload.available_from) {
        form.append("available_from", payload.available_from);
    }

    const res = await apiClient.post(`/jobs/${jobId}/apply/`, form, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
}

export async function getApplicationById(id: string | number): Promise<Application> {
    const res = await apiClient.get(`/applications/${id}/`);
    return res.data;
}

export async function listApplications(): Promise<Application[]> {
    const res = await apiClient.get<Application[]>("/applications/");
    return res.data;
}

export async function getApplication(id: string | number): Promise<Application> {
    const res = await apiClient.get<Application>(`/applications/${id}/`);
    return res.data;
}

export type UpdateApplicationPayload = {
    status: ApplicationStatus;
    notes?: string;
};

export async function updateApplicationStatus(
    id: string | number,
    payload: UpdateApplicationPayload
): Promise<Application> {
    const res = await apiClient.patch<Application>(`/applications/${id}/`, payload);
    return res.data;
}

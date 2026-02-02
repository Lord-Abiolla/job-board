import { apiClient } from "@/lib/api/client";
import type { Job, JobUpsertPayload } from "@/types/job";

type Paginated<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export async function getJobs(params?: {
    search?: string;
    job_type?: string;
    employment_type?: string;
    status?: string;
    mine?: boolean;
    page?: number;
}): Promise<Job[]> {
    const res = await apiClient.get<Paginated<Job> | Job[]>("/jobs/", { params });

    const data = res.data;
    return Array.isArray(data) ? data : data.results;
}

export async function createJob(payload: JobUpsertPayload): Promise<Job> {
    const res = await apiClient.post<Job>("/jobs/", payload);
    return res.data;
}

export async function updateJob(id: string | number, payload: Partial<JobUpsertPayload>): Promise<Job> {
    const res = await apiClient.patch<Job>(`/jobs/${id}/`, payload);
    return res.data;
}

export async function deleteJob(id: string | number): Promise<void> {
    await apiClient.delete(`/jobs/${id}/`);
}

export async function getJobById(id: string | number): Promise<Job> {
    const res = await apiClient.get<Job>(`/jobs/${id}/`);
    return res.data;
}

import { apiClient } from "./client";
import type { Job } from "@/types/job";

// GET Jobs
export async function getJobs(): Promise<Job[]> {
    const res = await apiClient.get<{results?: Job[]} | Job[]>("/jobs/");

    const data = res.data;
    return Array.isArray(data) ? data : data.results ?? [];
}

// GET /jobs/:id/
export async function getJobById(id: string | number): Promise<Job> {
    const res = await apiClient.get<Job>(`/jobs/${id}`);
    return res.data;
}

// POST /jobs/:id/apply/
export async function applyToJob(id: string | number) {
    const res = await apiClient.post(`/jobs/${id}/apply`);
    return res.data;
}

// Employer only
export async function createJob(payload: Partial<Job>) {
    const res = await apiClient.post<Job>("/jobs/", payload);
    return res.data;
}

export async function updateJob(id: string | number, payload: Partial<Job>) {
    const res = await apiClient.put<Job>(`/jobs/${id}`, payload);
    return res.data;
}

export async function deleteJob(id: string | number) {
    await apiClient.delete(`/jobs/${id}`);
}
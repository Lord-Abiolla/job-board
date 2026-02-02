import { apiClient } from "@/lib/api/client";

export async function applyToJob(jobId: string | number, payload?: { resume?: string }) {
    const res = await apiClient.post(`/jobs/${jobId}/apply/`, payload ?? {});
    return res.data;
}

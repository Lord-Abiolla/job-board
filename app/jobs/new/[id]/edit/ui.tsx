"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import JobForm from "@/components/jobs/JobForm";
import { deleteJob, getJobById, updateJob } from "@/lib/api/jobs";
import type { Job, JobUpsertPayload } from "@/types/job";

export default function JobEditClient() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);
            try {
                const data = await getJobById(id);
                if (mounted) setJob(data);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-sm text-slate-600">Loading job...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">Job not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
            <div className="mx-auto max-w-3xl">
                <JobForm
                    mode="edit"
                    initial={job}
                    onSubmit={async (payload: JobUpsertPayload) => {
                        const updated = await updateJob(id, payload);
                        setJob(updated);
                        router.push(`/jobs/${updated.id}`);
                    }}
                    onDelete={async () => {
                        const ok = confirm("Are you sure you want to delete this job?");
                        if (!ok) return;
                        await deleteJob(id);
                        router.push("/");
                    }}
                />
            </div>
        </div>
    );
}

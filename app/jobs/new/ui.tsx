"use client";

import { useRouter } from "next/navigation";
import JobForm from "@/components/jobs/JobForm";
import { createJob } from "@/lib/api/jobs";
import type { JobUpsertPayload } from "@/types/job";

export default function JobCreateClient() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
            <div className="mx-auto max-w-3xl">
                <JobForm
                    mode="create"
                    onSubmit={async (payload: JobUpsertPayload) => {
                        const created = await createJob(payload);
                        router.push(`/jobs/${created.id}`);
                    }}
                />
            </div>
        </div>
    );
}

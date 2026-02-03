import { serverFetch } from "@/lib/server-api";
import type { Job } from "@/types/job";
import JobDetailUI from "./ui";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
    try {
        const job = (await serverFetch(`/jobs/${params.id}/`)) as Job;
        return <JobDetailUI job={job} />;
    } catch {
        notFound();
    }
}

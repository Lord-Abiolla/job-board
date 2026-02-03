import JobBoardDashboard from "@/components/dashboard/JobBoardDashboard";
import { serverFetch } from "@/lib/server-api";
import type { Job } from "@/types/job";

export default async function Home() {
  let jobs: Job[] = [];

  try {
    jobs = await serverFetch<Job[]>("/jobs/");
  } catch (e) {
    jobs = [];
  }

  return <JobBoardDashboard initialJobs={jobs} />;
}

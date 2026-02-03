import JobBoardDashboard from "@/components/dashboard/JobBoardDashboard";
import { serverFetch } from "@/lib/server-api";

export default async function Home() {
  const jobs = await serverFetch("/jobs/");

  return <JobBoardDashboard initialJobs={jobs} />;
}

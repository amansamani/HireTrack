import { getAllJobsAction } from "@/actions/jobs-pool";
import JobsPoolClient from "./JobsPoolClient";

export default async function JobsPoolPage() {
  // Fetch initial data securely on the server side
  const res = await getAllJobsAction();

  // Handle server-side errors before rendering the client engine
  if (res.error || !res.jobs) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-8">
        <h2 className="text-2xl font-semibold text-destructive">Error</h2>
        <p className="text-muted-foreground">{res.error || "Failed to load jobs."}</p>
      </div>
    );
  }

  // Pass clean, server-side validated data to the client component
  return <JobsPoolClient initialJobs={res.jobs as any} />;
}
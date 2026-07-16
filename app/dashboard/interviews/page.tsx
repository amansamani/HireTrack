import { getAllInterviewsAction } from "@/actions/interviews-pool";
import InterviewsPoolClient from "./InterviewsPoolClient";

export default async function InterviewsPoolPage() {
  const res = await getAllInterviewsAction();

  if (res.error || !res.interviews) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-8">
        <h2 className="text-2xl font-semibold text-destructive">Error</h2>
        <p className="text-muted-foreground">{res.error || "Failed to load interviews."}</p>
      </div>
    );
  }

  return <InterviewsPoolClient initialInterviews={res.interviews} />;
}
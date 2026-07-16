import { getAllCandidatesAction } from "@/actions/candidates-pool";
import CandidatesPoolClient from "./CandidatesPoolClient";

export default async function CandidatesPoolPage() {
  const res = await getAllCandidatesAction();

  if (res.error || !res.candidates) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-8">
        <h2 className="text-2xl font-semibold text-destructive">Error</h2>
        <p className="text-muted-foreground">{res.error || "Failed to load candidates."}</p>
      </div>
    );
  }

  return <CandidatesPoolClient initialCandidates={res.candidates} />;
}
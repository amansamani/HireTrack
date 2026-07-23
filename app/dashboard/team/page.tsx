import { getTeamAction } from "@/actions/team";
import TeamClient from "./TeamClient";

export default async function TeamPage() {
  const res = await getTeamAction();

  return (
    <TeamClient
      initialMembers={res.members ?? []}
      initialInvites={res.invites ?? []}
      currentUserId={res.currentUserId ?? ""}
      currentRole={res.currentRole ?? "INTERVIEWER"}
    />
  );
}
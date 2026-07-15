export const DEFAULT_ROUND_NAMES: Record<"TECHNICAL" | "HR", string> = {
  TECHNICAL: "Technical Interview Loop",
  HR: "HR Assessment Round",
};

export function defaultRoundNameFor(stage: string): string {
  return stage === "TECHNICAL" ? DEFAULT_ROUND_NAMES.TECHNICAL : DEFAULT_ROUND_NAMES.HR;
}
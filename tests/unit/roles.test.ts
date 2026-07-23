import { describe, it, expect } from "vitest";
import { canManageTeam, canEditPipeline } from "@/lib/roles";

describe("canManageTeam", () => {
  it("allows OWNER and ADMIN", () => {
    expect(canManageTeam("OWNER")).toBe(true);
    expect(canManageTeam("ADMIN")).toBe(true);
  });
  it("denies RECRUITER and INTERVIEWER", () => {
    expect(canManageTeam("RECRUITER")).toBe(false);
    expect(canManageTeam("INTERVIEWER")).toBe(false);
  });
});

describe("canEditPipeline", () => {
  it("denies only INTERVIEWER", () => {
    expect(canEditPipeline("INTERVIEWER")).toBe(false);
    expect(canEditPipeline("OWNER")).toBe(true);
    expect(canEditPipeline("ADMIN")).toBe(true);
    expect(canEditPipeline("RECRUITER")).toBe(true);
  });
});
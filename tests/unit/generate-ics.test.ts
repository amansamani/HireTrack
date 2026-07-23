import { describe, it, expect } from "vitest";
import { generateInterviewICS } from "@/lib/generate-ics";

describe("generateInterviewICS", () => {
  const start = new Date("2026-08-01T10:00:00.000Z");

  it("produces a valid VCALENDAR wrapper", () => {
    const ics = generateInterviewICS({
      uid: "test-uid",
      title: "Technical Round — Backend Engineer",
      description: "Interview with Jane Doe.",
      start,
      durationMinutes: 60,
    });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
  });

  it("computes DTEND from start + duration", () => {
    const ics = generateInterviewICS({ uid: "t2", title: "HR Round", description: "d", start, durationMinutes: 30 });
    expect(ics).toContain("DTSTART:20260801T100000Z");
    expect(ics).toContain("DTEND:20260801T103000Z");
  });

  it("escapes commas, semicolons, and newlines", () => {
    const ics = generateInterviewICS({
      uid: "t3",
      title: "Round A; Part 2, continued",
      description: "Line one\nLine two, with a comma; and a semicolon",
      start,
      durationMinutes: 60,
    });
    expect(ics).toContain("SUMMARY:Round A\\; Part 2\\, continued");
    expect(ics).toContain("DESCRIPTION:Line one\\nLine two\\, with a comma\\; and a semicolon");
  });

  it("includes the given UID scoped to the interview", () => {
    const ics = generateInterviewICS({ uid: "app123-1735689600000", title: "Round", description: "d", start, durationMinutes: 60 });
    expect(ics).toMatch(/UID:app123-1735689600000@hirekarlo\.amansamani\.me/);
  });
});
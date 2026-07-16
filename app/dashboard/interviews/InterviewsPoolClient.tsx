"use client";

import { Calendar, Briefcase, Clock, UserCheck } from "lucide-react";

type GlobalInterview = {
  id: string;
  round: string;
  interviewer: string;
  scheduledAt: Date | string;
  application: {
    job: { title: string };
    candidate: { fullName: string; email: string };
  };
};

export default function InterviewsPoolClient({ initialInterviews }: { initialInterviews: GlobalInterview[] }) {
  // No loading state needed! Data is already here from the server.
  
  if (initialInterviews.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Interview Schedule</h2>
          <p className="text-sm text-muted-foreground">Track upcoming candidate assessments and evaluation loops.</p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-card/40 py-12 text-center">
          <Calendar className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">No interviews scheduled yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Use the quick actions on a candidate&apos;s Kanban card to schedule rounds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Interview Schedule</h2>
        <p className="text-sm text-muted-foreground">Track upcoming candidate assessments and evaluation loops.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {initialInterviews.map((interview) => {
          // Calculate dates once per item to avoid redundant processing during re-renders
          const dateObj = new Date(interview.scheduledAt);
          const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const dateStr = dateObj.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

          return (
            <div key={interview.id} className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div className="space-y-0.5">
                  <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-primary">
                    {interview.round}
                  </span>
                  <h3 className="pt-1 text-sm font-semibold text-foreground">
                    {interview.application?.candidate?.fullName}
                  </h3>
                </div>

                <div className="space-y-1 text-right text-xs font-medium text-muted-foreground">
                  <div className="flex items-center justify-end gap-1.5 text-foreground/80">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    {timeStr}
                  </div>
                  <div className="font-mono text-[10px]">
                    {dateStr}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 p-2">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  <div className="truncate">
                    <p className="text-[10px] text-muted-foreground">Position</p>
                    <p className="truncate font-medium text-foreground/90">{interview.application?.job?.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 p-2">
                  <UserCheck className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  <div className="truncate">
                    <p className="text-[10px] text-muted-foreground">Interviewer</p>
                    <p className="truncate font-medium text-foreground/90">{interview.interviewer}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
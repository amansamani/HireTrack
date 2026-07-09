"use client";

import { useEffect, useState, startTransition, use } from "react";
import { toast } from "sonner";
import { ArrowLeft, User, Mail, Calendar, CheckCircle2, XCircle, Clock, ShieldCheck, Briefcase } from "lucide-react";
import Link from "next/link";
import { getJobApplicantsAction, updateApplicationStatusAction } from "@/actions/application";

type Application = {
  id: string;
  stage: string;
  createdAt: Date | string;
  candidate?: {
    fullName: string;
    email: string;
  };
};

const PIPELINE_STAGES = [
  { key: "APPLIED", name: "Applied", color: "text-blue-400 bg-blue-950/40 border-blue-800/60" },
  { key: "TECHNICAL", name: "Technical Interview", color: "text-purple-400 bg-purple-950/40 border-purple-800/60" },
  { key: "HR", name: "HR Round", color: "text-amber-400 bg-amber-950/40 border-amber-800/60" },
  { key: "OFFER", name: "Offer", color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/60" },
  { key: "REJECTED", name: "Rejected", color: "text-rose-400 bg-rose-950/40 border-rose-800/60" },
];

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchApplicants() {
    const res = await getJobApplicantsAction(jobId);
    if (res.applications) setApplicants(res.applications as any);
    setLoading(false);
  }

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  function handleStatusChange(applicationId: string, newStatus: string) {
    startTransition(async () => {
      const res = await updateApplicationStatusAction(applicationId, newStatus, jobId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res?.success);
        fetchApplicants();
      }
    });
  }

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/jobs" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Applicant Pipeline</h2>
          <p className="text-sm text-zinc-400">Track and progress candidates through the evaluation phases.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-500">Loading pipeline columns...</div>
      ) : (
        /* Kanban Columns Grid Layout - Auto stretches up to 5 stages cleanly */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {PIPELINE_STAGES.map((stage) => {
            const stageApplicants = applicants.filter((app) => app.stage === stage.key);

            return (
              <div key={stage.key} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4 min-h-[400px]">
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${stage.color}`}>
                    {stage.name}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                    {stageApplicants.length}
                  </span>
                </div>

                {/* Candidate Cards Column Stack */}
                <div className="space-y-3">
                  {stageApplicants.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-600 border border-dashed border-zinc-800/60 rounded-lg">
                      No candidates
                    </div>
                  ) : (
                    stageApplicants.map((app) => (
                      <div key={app.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 space-y-3 shadow-sm hover:border-zinc-700 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                            <User className="h-3.5 w-3.5 text-zinc-500" />
                            {app.candidate?.fullName || "Unnamed Candidate"}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <Mail className="h-3.5 w-3.5 text-zinc-500" />
                            {app.candidate?.email || "No email provided"}
                          </div>
                        </div>

                        {/* 2. Pipeline Action Buttons linked exactly to updated stages */}
                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-zinc-900">
                          {/* Move to Technical */}
                          {stage.key === "APPLIED" && (
                            <button onClick={() => handleStatusChange(app.id, "TECHNICAL")} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-purple-400 transition-colors" title="Move to Technical">
                              <Briefcase className="h-3.5 w-3.5" />
                            </button>
                          )}
                          
                          {/* Move to HR */}
                          {(stage.key === "APPLIED" || stage.key === "TECHNICAL") && (
                            <button onClick={() => handleStatusChange(app.id, "HR")} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-amber-400 transition-colors" title="Move to HR Round">
                              <Clock className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Move to Offer */}
                          {stage.key !== "OFFER" && stage.key !== "REJECTED" && (
                            <button onClick={() => handleStatusChange(app.id, "OFFER")} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-emerald-400 transition-colors" title="Extend Offer">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Move to Rejected */}
                          {stage.key !== "REJECTED" && (
                            <button onClick={() => handleStatusChange(app.id, "REJECTED")} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-rose-400 transition-colors" title="Mark as Rejected">
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
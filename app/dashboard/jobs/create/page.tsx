"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Briefcase, MapPin, Building2, AlignLeft, Loader2, Clock, ChevronDown, ListOrdered, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { createJobAction } from "@/actions/create-job";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [description, setDescription] = useState("");
  const [useCustomRounds, setUseCustomRounds] = useState(false);
  const [rounds, setRounds] = useState<string[]>([""]);

  function updateRound(index: number, value: string) {
    setRounds((prev) => prev.map((r, i) => (i === index ? value : r)));
  }

  function addRound() {
    setRounds((prev) => [...prev, ""]);
  }

  function removeRound(index: number) {
    setRounds((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    startTransition(async () => {
      const res = await createJobAction({
        title,
        department,
        location,
        type,
        description,
        interviewRounds: useCustomRounds ? rounds : [],
      });

      setLoading(false);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
        router.push("/dashboard/jobs");
      }
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/jobs"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Back to job openings"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Create New Position</h2>
          <p className="text-sm text-muted-foreground">Publish a new opening to your public application link.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-1.5">
          <label htmlFor="job-title" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Briefcase className="h-3 w-3" aria-hidden="true" /> Job Title
          </label>
          <Input id="job-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., MERN Stack Engineer" required />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="job-department" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Building2 className="h-3 w-3" aria-hidden="true" /> Department
            </label>
            <Input id="job-department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., Engineering" required />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="job-location" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3 w-3" aria-hidden="true" /> Location
            </label>
            <Input id="job-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Gorakhpur, UP" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="job-type" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden="true" /> Employment Type
          </label>
          <div className="relative">
            <select
              id="job-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ colorScheme: "dark", backgroundColor: "var(--background)", color: "var(--foreground)" }}
              className="h-8 w-full appearance-none rounded-lg border border-input px-2.5 pr-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="Full-time" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>Full-time</option>
              <option value="Part-time" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>Part-time</option>
              <option value="Remote" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>Remote</option>
              <option value="Contract" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>Contract</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="job-description" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <AlignLeft className="h-3 w-3" aria-hidden="true" /> Role Summary / Description
          </label>
          <Textarea id="job-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide information regarding expectations, skills requirement..." rows={4} className="resize-none" required />
        </div>

        <div className="space-y-2 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="custom-rounds-toggle" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ListOrdered className="h-3 w-3" aria-hidden="true" /> Interview Rounds
            </label>
            <button
              type="button"
              id="custom-rounds-toggle"
              role="switch"
              aria-checked={useCustomRounds}
              aria-labelledby="custom-rounds-label"
              onClick={() => setUseCustomRounds((v) => !v)}
                className={`
                relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full 
                transition-colors duration-200 ease-in-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                ${useCustomRounds ? "bg-primary" : "bg-input"}
    `          }
            >
              <span
                className={`
                  pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm 
                  transition-transform duration-200 ease-in-out
                  ${useCustomRounds ? "translate-x-4" : "translate-x-0.5"}
                `}
              />
            </button>
          </div>

          {!useCustomRounds ? (
            <p className="text-xs text-muted-foreground">
              Using the default pipeline rounds (Technical Interview, HR Round). Turn this on to define your own rounds for this job instead.
            </p>
          ) : (
            <div className="space-y-2 pt-1">
              {rounds.map((round, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={round} onChange={(e) => updateRound(i, e.target.value)} placeholder={`e.g., Round ${i + 1} — DSA / System Design / Culture Fit`} required />
                  <button
                    type="button"
                    onClick={() => removeRound(i)}
                    disabled={rounds.length === 1}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
                    aria-label={`Remove round ${i + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addRound} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add another round
              </button>
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading} className="mt-2 w-full gap-2 text-xs font-semibold">
          {loading ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Publishing Position...</>) : ("Publish Opening")}
        </Button>
      </form>
    </div>
  );
}
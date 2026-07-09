"use client";

import { useEffect, useState, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Briefcase, MapPin, Clock, DollarSign } from "lucide-react";
import Link from "next/link"; 
import { createJobAction, getJobsAction } from "@/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const JobSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  department: z.string().min(2, "Department is required"),
  location: z.string().min(2, "Location is required"),
  type: z.string().min(1, "Job type is required"),
  salaryRange: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salaryRange: string | null;
  description: string;
  status: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof JobSchema>>({
    resolver: zodResolver(JobSchema),
    defaultValues: { title: "", department: "", location: "", type: "Full-time", salaryRange: "", description: "" },
  });

  async function fetchJobs() {
    const res = await getJobsAction();
    if (res.jobs) setJobs(res.jobs);
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  function onSubmit(values: z.infer<typeof JobSchema>) {
    setIsSubmitting(true);
    startTransition(async () => {
      const res = await createJobAction(values);
      setIsSubmitting(false);

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res?.success || "Job created!");
        form.reset();
        setIsDialogOpen(false);
        fetchJobs();
      }
    });
  }

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Upper Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Job Openings</h2>
          <p className="text-sm text-zinc-400">Manage your active hiring pipelines and role postings.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50">
            <Plus className="h-4 w-4" /> Add Job
          </DialogTrigger>

          <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Create Job Posting</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Provide the operational specifics for this new vacancy.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Software Engineer" {...field} className="border-zinc-800 bg-zinc-950" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Engineering" {...field} className="border-zinc-800 bg-zinc-950" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Remote / New York" {...field} className="border-zinc-800 bg-zinc-950" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Full-time" {...field} className="border-zinc-800 bg-zinc-950" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="salaryRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Range (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="$100,000 - $130,000" {...field} className="border-zinc-800 bg-zinc-950" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Detail the technical responsibilities and goals for this role..." {...field} className="border-zinc-800 bg-zinc-950" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Publish Posting"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Jobs Feed / Dashboard Grid */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-16 text-center">
          <Briefcase className="h-10 w-10 text-zinc-500 stroke-[1.5]" />
          <h3 className="mt-4 text-base font-medium">No job openings published</h3>
          <p className="mt-1 text-sm text-zinc-400 max-w-sm">Create your first job listing to begin assembling and tracking candidate pools.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="border-zinc-800 bg-zinc-900 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300 border border-zinc-700">
                      {job.department}
                    </span>
                    {/* Maps to dashboard route scope */}
                    <Link href={`/dashboard/jobs/${job.id}`}>
                      <CardTitle className="text-lg font-semibold mt-1 hover:underline cursor-pointer text-zinc-100">
                        {job.title}
                      </CardTitle>
                    </Link>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    {job.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-zinc-400">
                <p className="line-clamp-2 text-zinc-300">{job.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{job.type}</span>
                  </div>
                  {job.salaryRange && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{job.salaryRange}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
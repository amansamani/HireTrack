"use client";

import { useEffect, useState, startTransition, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Briefcase, MapPin, Clock, DollarSign, CheckCircle2 } from "lucide-react";

import { submitApplicationAction } from "@/actions/public-apply";
import { getJobsAction } from "@/actions/jobs"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ApplySchema = z.object({
  candidateName: z.string().min(2, "Name must be at least 2 characters"),
  candidateEmail: z.string().email("Please provide a valid email address"),
});

export default function PublicJobApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof ApplySchema>>({
    resolver: zodResolver(ApplySchema),
    defaultValues: { candidateName: "", candidateEmail: "" },
  });

  useEffect(() => {
    // Basic trick to find the single job from the pool safely
    async function loadJob() {
      // Direct database lookup would be ideal, fetching from pool for now
      const res = await getJobsAction();
      const currentJob = res.jobs?.find((j: any) => j.id === jobId);
      if (currentJob) setJobDetails(currentJob);
      setLoading(false);
    }
    loadJob();
  }, [jobId]);

  function onSubmit(values: z.infer<typeof ApplySchema>) {
    startTransition(async () => {
      const payload = { jobId, ...values };
      const res = await submitApplicationAction(payload);

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res?.success);
        setSubmitted(true);
      }
    });
  }

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center text-sm">Loading job listing details...</div>;
  }

  if (!jobDetails) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center text-sm">Job posting not found or no longer accepting submissions.</div>;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-center p-6 space-y-4 shadow-xl">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 stroke-[1.5]" />
          </div>
          <CardTitle className="text-xl font-semibold">Application Received!</CardTitle>
          <p className="text-sm text-zinc-400">Thank you for applying to the {jobDetails.title} opening. The recruitment team has been notified.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Side: Job Scope Context */}
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300 border border-zinc-700">
              {jobDetails.department}
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50">{jobDetails.title}</h1>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800">
              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
              <span>{jobDetails.location}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800">
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              <span>{jobDetails.type}</span>
            </div>
            {jobDetails.salaryRange && (
              <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800">
                <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
                <span>{jobDetails.salaryRange}</span>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800 pt-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-200">Role Summary</h3>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{jobDetails.description}</p>
          </div>
        </div>

        {/* Right Side: Interactive Application Processing Panel */}
        <div className="lg:col-span-2">
          <Card className="border-zinc-800 bg-zinc-900/60 backdrop-blur shadow-lg sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Apply for this position</CardTitle>
              <CardDescription className="text-zinc-400">Submit your professional details to enter our pipeline.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="candidateName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="border-zinc-800 bg-zinc-950" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="candidateEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} className="border-zinc-800 bg-zinc-950" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-medium">
                    Submit Application
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
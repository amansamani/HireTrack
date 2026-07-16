import Link from "next/link";
import { Briefcase, ArrowUpRight, Users2, UserCheck, CalendarCheck2, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecruiterAnalyticsAction } from "@/actions/analytics";

type StatsData = {
  totalJobs: number;
  totalApplications: number;
  totalOffers: number;
  totalInterviews: number;
  totalHired: number;
};

const STAT_DEFS = [
  { key: "totalJobs", label: "Total Postings", hint: "Live open job board paths", icon: Briefcase, tone: "text-chart-2 bg-chart-2/10" },
  { key: "totalApplications", label: "Total Applications", hint: "Incoming candidates in database", icon: Users2, tone: "text-primary bg-primary/10" },
  { key: "totalInterviews", label: "Active Interviews", hint: "Candidates in Tech or HR rounds", icon: CalendarCheck2, tone: "text-warning bg-warning/10" },
  { key: "totalOffers", label: "Extended Offers", hint: "Successful offers drafted", icon: UserCheck, tone: "text-success bg-success/10" },
  { key: "totalHired", label: "Total Hired", hint: "Candidates who accepted a role", icon: Trophy, tone: "text-chart-4 bg-chart-4/10" },
] as const;

export default async function DashboardPage() {
  // Fetch directly on the server
  const res = await getRecruiterAnalyticsAction();
  const stats: StatsData = res.stats || {
    totalJobs: 0,
    totalApplications: 0,
    totalOffers: 0,
    totalInterviews: 0,
    totalHired: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
          <p className="text-sm text-muted-foreground">Track key pipeline metrics at a glance.</p>
        </div>
        <Link
          href="/dashboard/jobs"
          className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Manage Jobs <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STAT_DEFS.map((def) => {
          const Icon = def.icon;
          return (
            <Card key={def.key} className="ring-1 ring-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md ${def.tone}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {def.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* No loading state needed! Data is already here. */}
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  {stats[def.key]}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{def.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
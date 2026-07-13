// app/dashboard/layout.tsx
import DashboardShell from "@/components/layout/dashboard-shell";
import AuthSessionProvider from "@/components/session-provider";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <AuthSessionProvider session={session}>
      <DashboardShell>{children}</DashboardShell>
    </AuthSessionProvider>
  );
}
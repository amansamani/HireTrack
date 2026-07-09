export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-zinc-100">Welcome to HireTrack</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Your auth state is verified and your postgres database is fully integrated.
        </p>
      </div>
    </div>
  );
}
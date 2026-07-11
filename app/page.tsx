import Link from "next/link";
import { ArrowRight, Users, Sparkles, Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="font-semibold tracking-tight">HireTrack</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-24 pb-32 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
          Hire faster, with an AI copilot reading every resume
        </h1>
        <p className="mt-5 text-lg text-zinc-400 max-w-xl mx-auto">
          Post a job, share one link, and let HireTrack parse and score every applicant automatically —
          so you spend your time interviewing, not skimming PDFs.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-zinc-100 text-zinc-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors"
          >
            Start hiring free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-zinc-800 px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:border-zinc-700 transition-colors"
          >
            Log in
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="border border-zinc-800 rounded-xl p-5">
            <Sparkles className="h-5 w-5 text-purple-400 mb-3" />
            <h3 className="font-medium text-sm mb-1.5">AI resume scoring</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Every applicant's resume is parsed and matched against the job description automatically.
            </p>
          </div>
          <div className="border border-zinc-800 rounded-xl p-5">
            <Users className="h-5 w-5 text-blue-400 mb-3" />
            <h3 className="font-medium text-sm mb-1.5">One pipeline, zero spreadsheets</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              A kanban view of every candidate, from applied to offer, with full activity history.
            </p>
          </div>
          <div className="border border-zinc-800 rounded-xl p-5">
            <Mail className="h-5 w-5 text-emerald-400 mb-3" />
            <h3 className="font-medium text-sm mb-1.5">Candidates stay informed</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Automatic email updates on every stage change — no candidate left wondering.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
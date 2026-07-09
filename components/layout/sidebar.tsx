"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  BriefcaseBusiness
} from "lucide-react";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Interviews", href: "/interviews", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-900 text-zinc-100">
      {/* Logo Branding */}
      <div className="flex h-16 items-center px-6 border-b border-zinc-800 gap-2">
        <BriefcaseBusiness className="h-6 w-6 text-zinc-100" />
        <span className="text-lg font-bold tracking-tight">HireTrack</span>
      </div>

      {/* Primary Links */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group duration-200",
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-100")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Logout Area */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-red-950/30 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}
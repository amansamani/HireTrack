"use client";

import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  
 
  const segment = pathname.split("/")[1] || "Dashboard";
  const pageTitle = segment.charAt(0).toUpperCase() + segment.slice(1);

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-8 text-zinc-100">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-4">
        {}
        <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300 select-none">
          HR
        </div>
      </div>
    </header>
  );
}
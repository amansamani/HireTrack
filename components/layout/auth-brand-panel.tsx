import Link from "next/link";
import Image from "next/image";
type Point = {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
};

export function AuthBrandPanel({
  heading,
  subheading,
  points,
}: {
  heading: string;
  subheading: string;
  points: Point[];
}) {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-card/60 p-10 backdrop-blur-xl backdrop-saturate-150 lg:flex">
      <div
        className="animate-pulse pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <Link
       href="/"
      className="animate-in fade-in-0 relative z-10 flex items-center gap-2 duration-700"
      >
      <Image
        src="/logo.webp"
        alt="HireKarlo Logo"
        width={112} 
        height={28} 
        className="h-7 w-auto object-contain"
        priority    
      />
      <span className="font-semibold tracking-tight">
            HireKarlo
      </span>
      </Link>
      
      <div className="relative z-10 max-w-sm space-y-6">
        <div className="animate-in fade-in-0 slide-in-from-left-4 space-y-2 duration-700 fill-mode-backwards">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">{heading}</h2>
          <p className="text-sm text-muted-foreground">{subheading}</p>
        </div>
        <ul className="space-y-3">
          {points.map((point, i) => {
            const Icon = point.icon;
            return (
              <li
                key={i}
                className="animate-in fade-in-0 slide-in-from-left-4 flex items-center gap-3 text-sm text-foreground/90 duration-700 fill-mode-backwards"
                style={{ animationDelay: `${150 + i * 100}ms` }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </span>
                {point.text}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-muted-foreground">
        Built by Aman Samani · amansamani.me
      </p>
    </div>
  );
}
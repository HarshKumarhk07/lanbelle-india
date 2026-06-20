import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

interface LogoProps {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}

/** Lanbel wordmark — a serif mark with a soft gradient monogram. */
export function Logo({ className, href = "/", showWordmark = true }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={`${siteConfig.name} home`}
      className={cn("group flex items-center gap-2.5", className)}
    >
      <span className="relative grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary via-primary to-gold text-primary-foreground shadow-soft transition-transform duration-300 group-hover:scale-105">
        <span className="font-serif text-lg font-semibold leading-none">
          L
        </span>
      </span>
      {showWordmark && (
        <span className="font-serif text-xl font-semibold tracking-tight">
          {siteConfig.name}
        </span>
      )}
    </Link>
  );
}

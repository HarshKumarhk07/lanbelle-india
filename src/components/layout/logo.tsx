import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

interface LogoProps {
  className?: string;
  href?: string;
  invert?: boolean;
}

/** Lanbelle image logo — crops vertical whitespace and handles inverting colors. */
export function Logo({ className, href = "/", invert = false }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={`${siteConfig.name} home`}
      className={cn("group flex items-center", className)}
    >
      <div className="relative h-8 w-32 overflow-hidden">
        {/* 
          The original logo.png is a square image with substantial vertical white space.
          By rendering it inside a square container (h-32 w-32) that is centered vertically
          and cropped by the parent's overflow-hidden, we remove the extra margin.
        */}
        <div className="absolute inset-x-0 h-32 top-1/2 -translate-y-1/2">
          <Image
            src="/logo.png"
            alt={siteConfig.name}
            fill
            sizes="128px"
            className={cn(
              "object-contain transition-transform duration-300 group-hover:scale-105",
              invert ? "invert brightness-200" : "dark:invert"
            )}
            priority
          />
        </div>
      </div>
    </Link>
  );
}

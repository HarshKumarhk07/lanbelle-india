import Link from "next/link";
import { Instagram, Facebook, Youtube, Send, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { siteConfig, footerNav } from "@/lib/site-config";

const socials = [
  { label: "Instagram", href: siteConfig.social.instagram, Icon: Instagram },
  { label: "Facebook", href: siteConfig.social.facebook, Icon: Facebook },
  { label: "YouTube", href: siteConfig.social.youtube, Icon: Youtube },
];

const columns = [
  { title: "Shop", links: footerNav.shop },
  { title: "Support", links: footerNav.support },
  { title: "Company", links: footerNav.company },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-cream/40">
      <div className="container-px mx-auto max-w-7xl py-14">
        {/* Newsletter */}
        <div className="mb-14 grid gap-8 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/30 to-gold/10 p-8 md:grid-cols-2 md:items-center md:p-12">
          <div>
            <h3 className="font-serif text-2xl font-semibold md:text-3xl">
              Join the Lanbel glow list
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Be first to know about new K-beauty drops, restocks and
              members-only offers. No spam, just glow.
            </p>
          </div>
          <form className="flex w-full items-center gap-2">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Enter your email"
              className="h-12 w-full rounded-full border border-border bg-background/80 px-5 text-sm outline-none transition focus:border-primary focus:ring-[3px] focus:ring-ring/30"
            />
            <Button type="submit" size="lg" aria-label="Subscribe">
              <Send className="size-4" />
              <span className="hidden sm:inline">Subscribe</span>
            </Button>
          </form>
        </div>

        {/* Links */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
              <ShieldCheck className="size-4 text-success" />
              100% Authentic · Imported from South Korea
            </div>
            <div className="mt-6 flex items-center gap-2">
              {socials.map(({ label, href, Icon }) => (
                <Button
                  key={label}
                  asChild
                  variant="outline"
                  size="icon-sm"
                  aria-label={label}
                >
                  <a href={href} target="_blank" rel="noreferrer noopener">
                    <Icon className="size-[18px]" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="text-sm font-semibold tracking-wide">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <p className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/shipping" className="hover:text-foreground">
              Shipping
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/lib/site-config";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { cn } from "@/lib/utils";

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const { totals, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="container-px mx-auto max-w-7xl pt-3">
        <nav
          className={cn(
            "flex h-16 items-center justify-between gap-4 rounded-full border px-3 pl-5 transition-all duration-300",
            scrolled
              ? "glass border-border shadow-lift"
              : "border-transparent bg-background/40 backdrop-blur-sm",
          )}
        >
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isActive(item.href) && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon-sm" aria-label="Search">
              <Search className="size-[18px]" />
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              aria-label="Wishlist"
              className="relative hidden sm:inline-flex"
            >
              <Link href="/wishlist">
                <Heart className="size-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Cart"
              onClick={openCart}
              className="relative"
            >
              <ShoppingBag className="size-[18px]" />
              {totals.itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {totals.itemCount}
                </span>
              )}
            </Button>

            <ThemeToggle />

            <UserMenu />

            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              key="sheet"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="container-px absolute inset-x-0 top-full z-50 mx-auto mt-2 max-w-7xl lg:hidden"
            >
              <div className="glass rounded-2xl border border-border p-3 shadow-lift">
                <ul className="grid gap-1">
                  {mainNav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                          isActive(item.href)
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:bg-accent/60",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-1 flex items-center gap-2 border-t border-border pt-3">
                  <Button asChild className="flex-1" variant="outline">
                    <Link href="/login">
                      <User className="size-4" /> Login
                    </Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/wishlist">
                      <Heart className="size-4" /> Wishlist
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

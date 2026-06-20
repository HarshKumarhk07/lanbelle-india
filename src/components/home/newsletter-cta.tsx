import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export function NewsletterCta() {
  return (
    <section className="container-px mx-auto max-w-7xl py-16 md:py-24">
      <Reveal className="relative overflow-hidden rounded-[2rem] bg-plum px-6 py-16 text-center text-cream md:px-16 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-primary/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-10 size-72 rounded-full bg-gold/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-1.5 text-xs font-medium ring-1 ring-cream/20">
            <Sparkles className="size-3.5 text-gold" />
            Your glow-up starts here
          </span>
          <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight md:text-5xl">
            Ready to experience{" "}
            <span className="italic text-gold">authentic K-beauty?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-cream/70 md:text-base">
            Join thousands who trust Lanbel for genuine Korean skincare,
            delivered straight from Seoul.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gold">
              <Link href="/shop">
                Start shopping <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-cream/30 bg-transparent text-cream hover:bg-cream/10 hover:text-cream"
            >
              <Link href="/register">Create an account</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

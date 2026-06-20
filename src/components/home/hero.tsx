"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles, ShieldCheck, Star } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

const collage = [
  { src: "/natural deep cleansing oil.webp", className: "col-span-2 row-span-2", alt: "Lanbelle Natural Deep Cleansing Oil" },
  { src: "/Lanbelle vita energy blemish clear ampoule.webp", className: "col-span-1 row-span-1", alt: "Lanbelle Vita Energy Blemish Clear Ampoule" },
  { src: "/LANBELLE Natural Deep Cleansing Oil 200ml Korea Beauty Made in Korea.jpg", className: "col-span-1 row-span-2", alt: "Lanbelle Natural Deep Cleansing Oil 200ml" },
  { src: "/Lanbelle vita energy blemish clear ampoule.webp", className: "col-span-1 row-span-1", alt: "Lanbelle Vita Energy Blemish Clear Ampoule" },
];

const float = (delay: number) => ({
  animate: { y: [0, -10, 0] },
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut", delay },
});

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 size-[34rem] rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 size-[28rem] rounded-full bg-gold/15 blur-3xl"
      />

      <div className="container-px mx-auto grid max-w-7xl items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-8">
        {/* Copy */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-accent/60 px-4 py-1.5 text-xs font-medium text-accent-foreground ring-1 ring-border"
          >
            <Sparkles className="size-3.5 text-primary" />
            100% Authentic · Imported directly from South Korea
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 font-serif text-5xl font-semibold leading-[1.04] tracking-tight md:text-6xl xl:text-7xl"
          >
            Korean skincare,{" "}
            <span className="text-gradient-brand italic">delivered</span> to your
            door
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-md text-base text-muted-foreground md:text-lg"
          >
            Discover cult-favourite cleansers, serums and SPF — sourced straight
            from Seoul in original sealed packaging, for that effortless
            glass-skin glow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button asChild size="lg">
              <Link href="/shop">
                Shop the collection
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/best-sellers">Explore best sellers</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-success" />
              <span className="text-sm text-muted-foreground">
                Authenticity guaranteed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="size-5 fill-gold text-gold" />
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">4.9</strong> from 50k+
                reviews
              </span>
            </div>
          </motion.div>
        </div>

        {/* Collage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative grid aspect-square grid-cols-3 grid-rows-3 gap-3 md:gap-4"
        >
          {collage.map((tile, i) => (
            <motion.div
              key={tile.src + i}
              {...float(i * 0.4)}
              className={`relative overflow-hidden rounded-3xl shadow-lift ${tile.className}`}
            >
              <Image
                src={tile.src}
                alt={tile.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 50vw, 30vw"
                className="object-cover"
              />
            </motion.div>
          ))}

          {/* Floating stat chip */}
          <motion.div
            {...float(0.8)}
            className="glass absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl border border-border p-3 shadow-lift"
          >
            <div className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">500+ K-beauty</p>
              <p className="text-xs text-muted-foreground">products in stock</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { Instagram } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { instagramPosts } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site-config";

export function InstagramSection() {
  return (
    <section className="container-px mx-auto max-w-7xl py-16 md:py-24">
      <SectionHeading
        align="center"
        eyebrow="@lanbel"
        title={
          <>
            Glow with us on{" "}
            <span className="text-gradient-brand italic">Instagram</span>
          </>
        }
        description="Tag #LanbelGlow to be featured. Real routines, real results."
      />

      <Stagger className="mt-10 grid grid-cols-3 gap-3 md:grid-cols-6">
        {instagramPosts.map((post) => (
          <StaggerItem key={post.id}>
            <a
              href={post.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative block aspect-square overflow-hidden rounded-2xl"
            >
              <Image
                src={post.image}
                alt="Lanbel on Instagram"
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <span className="absolute inset-0 grid place-items-center bg-primary/0 text-primary-foreground opacity-0 transition-all duration-300 group-hover:bg-primary/40 group-hover:opacity-100">
                <Instagram className="size-6" />
              </span>
            </a>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-8 text-center">
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
        >
          <Instagram className="size-4" /> Follow @lanbel
        </a>
      </div>
    </section>
  );
}

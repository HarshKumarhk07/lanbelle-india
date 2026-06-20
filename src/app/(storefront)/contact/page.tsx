"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/marketing/content";
import { apiPost } from "@/lib/api-client";
import { applyApiErrors } from "@/lib/form";
import { siteConfig } from "@/lib/site-config";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";

const channels = [
  { icon: Mail, label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { icon: Phone, label: "Phone", value: siteConfig.phone, href: `tel:${siteConfig.phone}` },
  { icon: MapPin, label: "Locations", value: siteConfig.address },
];

export default function ContactPage() {
  const [sent, setSent] = React.useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await apiPost("/contact", values);
      setSent(true);
    } catch (error) {
      toast.error(applyApiErrors(error, setError));
    }
  });

  return (
    <div className="container-px mx-auto max-w-7xl py-16">
      <PageHeader
        eyebrow="We're here to help"
        title="Get in touch"
        description="Questions about a product, your order, or shipping from Korea? Our team usually replies within a few hours."
      />

      <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {channels.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
                <c.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </p>
                {c.href ? (
                  <a href={c.href} className="font-medium hover:text-primary">
                    {c.value}
                  </a>
                ) : (
                  <p className="font-medium">{c.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          {sent ? (
            <div className="grid place-items-center gap-3 py-12 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="size-7" />
              </div>
              <h2 className="font-serif text-xl font-semibold">Message sent</h2>
              <p className="text-sm text-muted-foreground">
                Thanks for reaching out — we&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...register("subject")} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" className="min-h-32" {...register("message")} />
                {errors.message && (
                  <p className="text-xs text-destructive">{errors.message.message}</p>
                )}
              </div>
              <Button type="submit" size="lg" className="w-fit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Send message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

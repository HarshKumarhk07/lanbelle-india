"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api-client";
import { getErrorMessage, cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export function ReviewForm({ productId }: { productId: string }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Please sign in to write a review.
        </p>
        <Button asChild className="mt-3" size="sm">
          <Link href={`/login?next=${pathname}`}>Sign in</Link>
        </Button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/reviews", { productId, rating, title, comment });
      toast.success("Review submitted — thank you!");
      setRating(0);
      setTitle("");
      setComment("");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <h3 className="font-medium">Write a review</h3>

      <div className="mt-3 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const v = i + 1;
          return (
            <button
              key={v}
              type="button"
              aria-label={`${v} star${v > 1 ? "s" : ""}`}
              onClick={() => setRating(v)}
              onMouseEnter={() => setHover(v)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5"
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  (hover || rating) >= v
                    ? "fill-gold text-gold"
                    : "text-muted-foreground/40",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="review-title" className="text-xs text-muted-foreground">
            Title (optional)
          </Label>
          <Input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum it up in a line"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="review-comment" className="text-xs text-muted-foreground">
            Your review
          </Label>
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think? How did your skin respond?"
            required
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-fit">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Submit review
        </Button>
      </div>
    </form>
  );
}

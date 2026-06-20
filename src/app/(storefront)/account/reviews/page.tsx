"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2, BadgeCheck, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingStars } from "@/components/product/rating-stars";
import { apiGet, apiDelete } from "@/lib/api-client";
import { formatDate, getErrorMessage } from "@/lib/utils";
import type { ReviewDTO } from "@/types";

const KEY = ["account", "reviews"] as const;

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () => apiGet<{ reviews: ReviewDTO[] }>("/account/reviews"),
  });

  const reviews = data?.reviews ?? [];

  const onDelete = async (id: string) => {
    try {
      await apiDelete(`/account/reviews/${id}`);
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Review deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-accent/60 text-primary">
          <MessageSquare className="size-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          You haven&apos;t written any reviews yet
        </p>
        <Button asChild size="sm">
          <Link href="/shop">Shop & review</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-semibold">My reviews</h2>
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex gap-4">
            {review.product && (
              <Link
                href={`/products/${review.product.slug}`}
                className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted"
              >
                <Image
                  src={review.product.image}
                  alt={review.product.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </Link>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {review.product && (
                    <Link
                      href={`/products/${review.product.slug}`}
                      className="text-sm font-medium hover:text-primary"
                    >
                      {review.product.name}
                    </Link>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <RatingStars value={review.rating} />
                    {review.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-xs text-success">
                        <BadgeCheck className="size-3.5" /> Verified
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(review.id)}
                  aria-label="Delete review"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              {review.title && (
                <p className="mt-2 text-sm font-medium">{review.title}</p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                {review.comment}
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3" /> {review.helpfulCount} found helpful ·{" "}
                {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

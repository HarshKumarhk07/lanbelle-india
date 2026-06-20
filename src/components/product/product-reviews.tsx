import { BadgeCheck } from "lucide-react";
import { RatingStars } from "@/components/product/rating-stars";
import { ReviewForm } from "@/components/product/review-form";
import { getProductReviews } from "@/services/review.service";
import { formatDate } from "@/lib/utils";
import type { ReviewDTO } from "@/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function ProductReviews({
  productId,
  rating,
  reviewCount,
}: {
  productId: string;
  rating: number;
  reviewCount: number;
}) {
  let reviews: ReviewDTO[] = [];
  try {
    const result = await getProductReviews(productId, 1, 10);
    reviews = result.items;
  } catch {
    reviews = [];
  }

  return (
    <section className="mt-20">
      <h2 className="font-serif text-2xl font-semibold">Customer reviews</h2>

      <div className="mt-4 grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="font-serif text-5xl font-semibold">
              {rating.toFixed(1)}
            </p>
            <RatingStars value={rating} size={18} className="mt-2 justify-center" />
            <p className="mt-2 text-sm text-muted-foreground">
              Based on {reviewCount.toLocaleString("en-IN")} review
              {reviewCount === 1 ? "" : "s"}
            </p>
          </div>
          <ReviewForm productId={productId} />
        </div>

        <div>
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No reviews yet — be the first to share your experience.
            </div>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-gold text-xs font-semibold text-primary-foreground">
                      {initials(review.userName)}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{review.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    {review.isVerifiedPurchase && (
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-success">
                        <BadgeCheck className="size-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <RatingStars value={review.rating} className="mt-3" />
                  {review.title && (
                    <p className="mt-2 text-sm font-medium">{review.title}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

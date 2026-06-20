"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Trash2, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingStars } from "@/components/product/rating-stars";
import { apiGet, apiPatch, apiDelete } from "@/lib/api-client";
import { getErrorMessage, formatDate, cn } from "@/lib/utils";
import type { AdminReviewRow } from "@/services/admin.service";
import type { Paginated } from "@/types";

const STATUSES = ["all", "pending", "approved", "rejected"] as const;

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = React.useState<string>("all");

  const KEY = ["admin", "reviews", status] as const;
  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () =>
      apiGet<Paginated<AdminReviewRow>>(`/admin/reviews?status=${status}`),
  });
  const reviews = data?.items ?? [];

  const moderate = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      await apiPatch(`/admin/reviews/${id}`, { status: newStatus });
      toast.success(`Review ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: KEY });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await apiDelete(`/admin/reviews/${id}`);
      toast.success("Review deleted");
      queryClient.invalidateQueries({ queryKey: KEY });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Reviews</h1>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition",
              status === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/50",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-60" />
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
          <MessageSquare className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{r.productName}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <RatingStars value={r.rating} />
                    <span className="text-xs text-muted-foreground">
                      by {r.userName} · {formatDate(r.createdAt)}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={
                    r.status === "approved"
                      ? "success"
                      : r.status === "rejected"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {r.status}
                </Badge>
              </div>

              {r.title && <p className="mt-3 text-sm font-medium">{r.title}</p>}
              <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>

              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                {r.status !== "approved" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-success"
                    onClick={() => moderate(r.id, "approved")}
                  >
                    <Check className="size-3.5" /> Approve
                  </Button>
                )}
                {r.status !== "rejected" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moderate(r.id, "rejected")}
                  >
                    <X className="size-3.5" /> Reject
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(r.id)}
                >
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

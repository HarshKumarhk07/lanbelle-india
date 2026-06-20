"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/product/rating-stars";
import type { ProductCardDTO } from "@/types";
import { cn, formatPrice, discountPercent } from "@/lib/utils";
import { shippingNotice } from "@/lib/site-config";

interface ProductQuickViewProps {
  product: ProductCardDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: () => void;
  wished: boolean;
  onToggleWish: () => void;
}

export function ProductQuickView({
  product,
  open,
  onOpenChange,
  onAddToCart,
  wished,
  onToggleWish,
}: ProductQuickViewProps) {
  const discount = discountPercent(product.mrp, product.price);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-muted md:aspect-auto">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 384px"
              className="object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute left-3 top-3 bg-destructive">
                -{discount}%
              </Badge>
            )}
          </div>

          <div className="flex flex-col p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {product.brand} · {product.category}
            </p>
            <DialogTitle className="mt-1.5 text-2xl">
              {product.name}
            </DialogTitle>

            <div className="mt-3 flex items-center gap-2">
              <RatingStars value={product.rating} size={16} />
              <span className="text-sm text-muted-foreground">
                {product.rating} · {product.reviewCount.toLocaleString("en-IN")}{" "}
                reviews
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-semibold">
                {formatPrice(product.price)}
              </span>
              {discount > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              An authentic Korean formulation, imported in original sealed
              packaging. Add it to your routine for visibly healthier, glass-skin
              results.
            </p>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-accent/40 p-3 text-xs text-accent-foreground">
              <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{shippingNotice.short}</span>
            </div>

            <div className="mt-auto flex items-center gap-2 pt-6">
              <Button
                className="flex-1"
                size="lg"
                disabled={product.stock <= 0}
                onClick={onAddToCart}
              >
                <ShoppingBag className="size-4" /> Add to cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Toggle wishlist"
                onClick={onToggleWish}
                className="size-13"
              >
                <Heart
                  className={cn("size-5", wished && "fill-primary text-primary")}
                />
              </Button>
            </div>

            <Button asChild variant="link" className="mt-2 self-start px-0">
              <Link href={`/products/${product.slug}`}>
                View full details <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

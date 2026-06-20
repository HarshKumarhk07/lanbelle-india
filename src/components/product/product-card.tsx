"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, ShoppingBag, Check } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/product/rating-stars";
import { ProductQuickView } from "@/components/product/product-quick-view";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import type { ProductCardDTO, ProductBadge } from "@/types";
import { cn, formatPrice, discountPercent } from "@/lib/utils";

const badgeLabels: Record<ProductBadge, { label: string; variant: "default" | "gold" | "soft" }> = {
  best: { label: "Best Seller", variant: "default" },
  featured: { label: "Featured", variant: "gold" },
  new: { label: "New", variant: "soft" },
  trending: { label: "Trending", variant: "soft" },
};

interface ProductCardProps {
  product: ProductCardDTO;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [added, setAdded] = React.useState(false);
  const [quickViewOpen, setQuickViewOpen] = React.useState(false);

  const wished = has(product.id);
  const discount = discountPercent(product.mrp, product.price);
  const lowStock = product.stock > 0 && product.stock <= 8;
  const outOfStock = product.stock <= 0;

  const toggleWish = () => toggle(product);

  const addToCart = () => {
    if (outOfStock) return;
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow duration-300 hover:shadow-lift"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <Link href={`/products/${product.slug}`} aria-label={product.name}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          </Link>

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <Badge variant="default" className="bg-destructive">
                -{discount}%
              </Badge>
            )}
            {product.badges.map((b) => (
              <Badge key={b} variant={badgeLabels[b].variant}>
                {badgeLabels[b].label}
              </Badge>
            ))}
          </div>

          {/* Wishlist */}
          <button
            type="button"
            onClick={toggleWish}
            aria-label="Toggle wishlist"
            aria-pressed={wished}
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/80 text-foreground shadow-soft backdrop-blur transition hover:scale-105"
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                wished && "fill-primary text-primary",
              )}
            />
          </button>

          {/* Quick view (reveals on hover) */}
          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-background/90 backdrop-blur"
              onClick={() => setQuickViewOpen(true)}
            >
              <Eye className="size-4" /> Quick view
            </Button>
          </div>

          {outOfStock && (
            <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-[2px]">
              <span className="rounded-full bg-foreground/90 px-4 py-1.5 text-xs font-medium text-background">
                Out of stock
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug">
            <Link
              href={`/products/${product.slug}`}
              className="transition-colors hover:text-primary"
            >
              {product.name}
            </Link>
          </h3>

          <div className="mt-2 flex items-center gap-1.5">
            <RatingStars value={product.rating} />
            <span className="text-xs text-muted-foreground">
              {product.rating} ({product.reviewCount.toLocaleString("en-IN")})
            </span>
          </div>

          {lowStock && (
            <p className="mt-2 text-xs font-medium text-warning">
              Only {product.stock} left
            </p>
          )}

          <div className="mt-auto flex items-end justify-between gap-2 pt-4">
            <div>
              <p className="text-base font-semibold">
                {formatPrice(product.price)}
              </p>
              {discount > 0 && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.mrp)}
                </p>
              )}
            </div>
            <Button
              size="icon"
              aria-label="Add to cart"
              disabled={outOfStock}
              onClick={addToCart}
            >
              {added ? (
                <Check className="size-4" />
              ) : (
                <ShoppingBag className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </motion.article>

      <ProductQuickView
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        onAddToCart={addToCart}
        wished={wished}
        onToggleWish={toggleWish}
      />
    </>
  );
}

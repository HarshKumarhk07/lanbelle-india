"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Plane,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/product/rating-stars";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { cn, formatPrice } from "@/lib/utils";
import { shippingNotice } from "@/lib/site-config";
import type { ProductCardDTO, ProductDetailDTO } from "@/types";

const TABS = [
  { key: "description", label: "Description" },
  { key: "ingredients", label: "Ingredients" },
  { key: "how", label: "How to use" },
  { key: "benefits", label: "Benefits" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ProductView({ product }: { product: ProductDetailDTO }) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { has, toggle } = useWishlist();
  const { add: recordView } = useRecentlyViewed();

  const [activeImage, setActiveImage] = React.useState(0);
  const [qty, setQty] = React.useState(1);
  const [tab, setTab] = React.useState<TabKey>("description");
  const [zoom, setZoom] = React.useState({ active: false, x: 50, y: 50 });

  const card: ProductCardDTO = React.useMemo(
    () => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      categorySlug: product.categorySlug,
      price: product.price,
      mrp: product.mrp,
      rating: product.rating,
      reviewCount: product.reviewCount,
      image: product.images[0]?.url ?? "",
      badges: product.badges,
      stock: product.stock,
    }),
    [product],
  );

  React.useEffect(() => {
    recordView(card);
  }, [card, recordView]);

  const wished = has(product.id);
  const outOfStock = product.stock <= 0;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      active: true,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const addToCart = () => addItem(card, qty);
  const buyNow = () => {
    addItem(card, qty);
    router.push("/checkout");
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Gallery */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row">
        <div className="flex gap-3 sm:flex-col">
          {product.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:size-20",
                i === activeImage
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <div
          className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-muted"
          onMouseMove={onMove}
          onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
        >
          <Image
            src={product.images[activeImage]?.url ?? card.image}
            alt={product.images[activeImage]?.alt ?? product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={cn(
              "object-cover transition-transform duration-200",
              zoom.active && "scale-[1.8]",
            )}
            style={
              zoom.active
                ? { transformOrigin: `${zoom.x}% ${zoom.y}%` }
                : undefined
            }
          />
        </div>
      </div>

      {/* Info */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.brand} · {product.category}
          </span>
          {product.discountPercent > 0 && (
            <Badge className="bg-destructive">-{product.discountPercent}%</Badge>
          )}
        </div>

        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
          {product.name}
        </h1>

        <div className="mt-3 flex items-center gap-2">
          <RatingStars value={product.rating} size={16} />
          <span className="text-sm text-muted-foreground">
            {product.rating} · {product.reviewCount.toLocaleString("en-IN")}{" "}
            reviews
          </span>
        </div>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="text-3xl font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.discountPercent > 0 && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
          {product.volume && (
            <span className="text-sm text-muted-foreground">
              · {product.volume}
            </span>
          )}
        </div>

        {product.shortDescription && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        )}

        {/* Stock */}
        <p className="mt-4 text-sm">
          {outOfStock ? (
            <span className="font-medium text-destructive">Out of stock</span>
          ) : product.stock <= 8 ? (
            <span className="font-medium text-warning">
              Only {product.stock} left in stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-success">
              <Check className="size-4" /> In stock
            </span>
          )}
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!outOfStock && (
            <QuantityStepper value={qty} max={product.stock} onChange={setQty} />
          )}
          <Button
            size="lg"
            className="flex-1"
            disabled={outOfStock}
            onClick={() => {
              addToCart();
              openCart();
            }}
          >
            <ShoppingBag className="size-4" /> Add to cart
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-12"
            aria-label="Toggle wishlist"
            onClick={() => toggle(card)}
          >
            <Heart
              className={cn("size-5", wished && "fill-primary text-primary")}
            />
          </Button>
        </div>
        <Button
          variant="plum"
          size="lg"
          className="mt-3 w-full"
          disabled={outOfStock}
          onClick={buyNow}
        >
          Buy it now
        </Button>

        {/* Trust badges */}
        <ul className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
          <li className="flex items-center gap-3">
            <ShieldCheck className="size-5 shrink-0 text-success" />
            100% authentic · original sealed Korean packaging
          </li>
          <li className="flex items-center gap-3">
            <Plane className="size-5 shrink-0 text-primary" />
            Imported directly from South Korea
          </li>
          <li className="flex items-start gap-3 text-muted-foreground">
            <Truck className="mt-0.5 size-5 shrink-0 text-primary" />
            {shippingNotice.short}
          </li>
        </ul>

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex flex-wrap gap-1 border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "relative px-4 py-2.5 text-sm font-medium transition-colors",
                  tab === t.key
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                {tab === t.key && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="py-5 text-sm leading-relaxed text-muted-foreground">
            {tab === "description" && <p>{product.description}</p>}
            {tab === "ingredients" && (
              <ul className="flex flex-wrap gap-2">
                {product.ingredients.map((ing) => (
                  <li
                    key={ing}
                    className="rounded-full bg-accent/60 px-3 py-1 text-xs text-accent-foreground"
                  >
                    {ing}
                  </li>
                ))}
              </ul>
            )}
            {tab === "how" && (
              <ol className="space-y-2">
                {product.howToUse.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            )}
            {tab === "benefits" && (
              <ul className="space-y-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <Check className="size-4 text-success" /> {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

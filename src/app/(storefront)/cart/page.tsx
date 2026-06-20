"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Tag,
  X,
  Truck,
  Plane,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { shippingNotice } from "@/lib/site-config";

export default function CartPage() {
  const {
    items,
    totals,
    couponCode,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const [code, setCode] = React.useState("");

  const onApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const { ok, message } = await applyCoupon(code);
    if (ok) {
      toast.success(message);
      setCode("");
    } else {
      toast.error(message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-px mx-auto flex max-w-xl flex-col items-center justify-center gap-5 py-24 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-accent/60 text-primary">
          <ShoppingBag className="size-9" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold">
            Your cart is empty
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Discover authentic Korean skincare and start your glow-up.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/shop">
            Start shopping <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-7xl py-12">
      <h1 className="font-serif text-3xl font-semibold">Shopping cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4 sm:p-5">
              <Link
                href={`/products/${item.slug}`}
                className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-28"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-medium leading-snug hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove"
                    className="text-muted-foreground transition hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-semibold">{formatPrice(item.price)}</span>
                  {item.mrp > item.price && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(item.mrp)}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <QuantityStepper
                    value={item.quantity}
                    max={item.stock}
                    onChange={(q) => updateQuantity(item.productId, q)}
                  />
                  <span className="text-sm font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg font-semibold">Order summary</h2>

            {/* Coupon */}
            <div className="mt-4">
              {couponCode ? (
                <div className="flex items-center justify-between rounded-xl border border-dashed border-success/50 bg-success/5 px-3 py-2.5 text-sm">
                  <span className="inline-flex items-center gap-2 font-medium text-success">
                    <Tag className="size-4" /> {couponCode}
                  </span>
                  <button
                    onClick={removeCoupon}
                    aria-label="Remove coupon"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={onApply} className="flex gap-2">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="h-10"
                  />
                  <Button type="submit" variant="outline" className="h-10">
                    Apply
                  </Button>
                </form>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground">
                Try WELCOME10, GLOW15 or KBEAUTY200
              </p>
            </div>

            <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
              {totals.savings > 0 && (
                <Row
                  label="MRP savings"
                  value={`– ${formatPrice(totals.savings)}`}
                  positive
                />
              )}
              {totals.discount > 0 && (
                <Row
                  label="Coupon discount"
                  value={`– ${formatPrice(totals.discount)}`}
                  positive
                />
              )}
              <Row
                label="Shipping"
                value={
                  totals.shippingFee === 0
                    ? "Free"
                    : formatPrice(totals.shippingFee)
                }
              />
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </div>
            </dl>

            <Button asChild size="lg" className="mt-5 w-full">
              <Link href="/checkout">
                Proceed to checkout <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>

          <div className="space-y-2 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <Truck className="size-4 text-primary" />
              Free shipping on orders over {formatPrice(1499)}
            </p>
            <p className="flex items-start gap-2">
              <Plane className="mt-0.5 size-4 shrink-0 text-primary" />
              {shippingNotice.short}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={positive ? "font-medium text-success" : "font-medium"}>
        {value}
      </dd>
    </div>
  );
}

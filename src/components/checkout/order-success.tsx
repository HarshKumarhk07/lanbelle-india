"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Plane, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";
import { shippingNotice } from "@/lib/site-config";
import type { OrderDTO } from "@/types";

export function OrderSuccess() {
  const orderId = useSearchParams().get("order");
  const [order, setOrder] = React.useState<OrderDTO | null>(null);
  const [loading, setLoading] = React.useState(Boolean(orderId));

  React.useEffect(() => {
    if (!orderId) return;
    apiGet<{ order: OrderDTO }>(`/orders/${orderId}`)
      .then((data) => setOrder(data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="container-px mx-auto max-w-2xl py-16 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="size-9" />
      </div>
      <h1 className="mt-6 font-serif text-3xl font-semibold">
        Thank you for your purchase!
      </h1>

      {loading ? (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading your order…
        </p>
      ) : order ? (
        <p className="mt-3 text-muted-foreground">
          Order <span className="font-semibold text-foreground">{order.orderNumber}</span>{" "}
          is confirmed. A confirmation email is on its way.
        </p>
      ) : (
        <p className="mt-3 text-muted-foreground">
          Your order is confirmed. A confirmation email is on its way.
        </p>
      )}

      {/* The exact authenticity & international shipping message */}
      <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-left">
        <div className="flex items-center gap-2 font-medium">
          <Plane className="size-5 text-primary" /> Imported from South Korea
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {shippingNotice.confirmation}
        </p>
      </div>

      {order && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Order total</span>
            <span className="font-semibold">{formatPrice(order.total)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated delivery</span>
            <span className="font-medium">
              {order.estimatedDeliveryMinDays}–{order.estimatedDeliveryMaxDays}{" "}
              business days
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span className="font-medium capitalize">
              {order.paymentMethod === "cod"
                ? "Cash on delivery"
                : order.paymentStatus}
            </span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href={order ? `/account/orders/${order.id}` : "/account/orders"}>
            <Package className="size-4" /> Track your order
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}

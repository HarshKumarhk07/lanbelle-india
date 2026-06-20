import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ChevronLeft,
  Plane,
  CreditCard,
  CheckCircle2,
  Cog,
  Truck,
  PackageCheck,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrder } from "@/services/order.service";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { shippingNotice } from "@/lib/site-config";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Order details" };

const FLOW: { key: OrderStatus; label: string; icon: typeof Cog }[] = [
  { key: "paid", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Processing", icon: Cog },
  { key: "dispatched", label: "Dispatched", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

const ORDER_RANK: Record<OrderStatus, number> = {
  pending: 0,
  paid: 1,
  processing: 2,
  dispatched: 3,
  delivered: 4,
  cancelled: -1,
  refunded: -1,
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;

  let order;
  try {
    order = await getUserOrder(user!.id, id);
  } catch {
    order = null;
  }
  if (!order) notFound();

  const rank = ORDER_RANK[order.status];
  const cancelled = order.status === "cancelled" || order.status === "refunded";

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold">
            {order.orderNumber}
          </h2>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      {!cancelled && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="grid grid-cols-4 gap-2">
            {FLOW.map((step) => {
              const reached = rank >= ORDER_RANK[step.key];
              return (
                <div key={step.key} className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "grid size-11 place-items-center rounded-full transition",
                      reached
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <step.icon className="size-5" />
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium",
                      reached ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-accent/40 p-3 text-xs text-muted-foreground">
            <Plane className="size-4 shrink-0 text-primary" />
            Estimated delivery: {order.estimatedDeliveryMinDays}–
            {order.estimatedDeliveryMaxDays} business days.{" "}
            {order.trackingNumber
              ? `Tracking: ${order.trackingNumber}`
              : shippingNotice.short}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="rounded-2xl border border-border bg-card">
          <h3 className="border-b border-border px-5 py-4 font-medium">
            Items ({order.items.length})
          </h3>
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.productId} className="flex gap-4 p-5">
                <Link
                  href={`/products/${item.slug}`}
                  className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{item.brand}</p>
                  <p className="mt-auto text-sm text-muted-foreground">
                    Qty {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatPrice(item.subtotal)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary + address */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-medium">Payment summary</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.discount > 0 && (
                <Row label="Discount" value={`– ${formatPrice(order.discount)}`} />
              )}
              <Row
                label="Shipping"
                value={
                  order.shippingFee === 0
                    ? "Free"
                    : formatPrice(order.shippingFee)
                }
              />
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CreditCard className="size-3.5" />
              {order.paymentMethod === "cod"
                ? "Cash on delivery"
                : `Paid online · ${order.paymentStatus}`}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-medium">Shipping address</h3>
            <address className="mt-2 text-sm not-italic text-muted-foreground">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2
                ? `, ${order.shippingAddress.line2}`
                : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.pincode}
              <br />
              {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone}
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { Package, ArrowRight, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserOrders } from "@/services/order.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatPrice, formatDate } from "@/lib/utils";
import type { OrderDTO } from "@/types";

export const metadata: Metadata = { title: "Account overview" };

export default async function AccountOverviewPage() {
  const user = await getCurrentUser();

  let recent: OrderDTO[] = [];
  let totalOrders = 0;
  try {
    const result = await listUserOrders(user!.id, 1, 3);
    recent = result.items;
    totalOrders = result.pagination.total;
  } catch {
    /* DB unavailable — show empty state */
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-accent/30 to-gold/10 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-serif text-2xl font-semibold">
            Welcome back, {user?.name.split(" ")[0]}
          </h2>
          {user?.isEmailVerified && (
            <Badge variant="success">
              <ShieldCheck className="size-3" /> Verified
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your orders, addresses and preferences here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total orders" value={String(totalOrders)} />
        <StatCard
          label="Account status"
          value={user?.isEmailVerified ? "Verified" : "Unverified"}
        />
        <StatCard label="Member" value="Lanbel" />
      </div>

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-medium">Recent orders</h3>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-accent/60 text-primary">
              <Package className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">No orders yet</p>
            <Button asChild size="sm">
              <Link href="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-accent/40"
                >
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)} · {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-sm font-semibold">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl font-semibold">{value}</p>
    </div>
  );
}

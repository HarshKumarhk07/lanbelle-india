import Link from "next/link";
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { getDashboardStats, type DashboardStats } from "@/services/admin.service";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  let stats: DashboardStats | null = null;
  try {
    stats = await getDashboardStats();
  } catch {
    stats = null;
  }

  const cards = [
    {
      label: "Revenue",
      value: stats ? formatPrice(stats.revenue) : "—",
      icon: IndianRupee,
    },
    { label: "Orders", value: stats?.orderCount ?? "—", icon: ShoppingCart },
    { label: "Products", value: stats?.productCount ?? "—", icon: Package },
    { label: "Customers", value: stats?.userCount ?? "—", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className="size-5 text-primary" />
            </div>
            <p className="mt-2 font-serif text-2xl font-semibold">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
          <span className="grid size-11 place-items-center rounded-full bg-warning/15 text-warning">
            <Clock className="size-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Pending fulfilment</p>
            <p className="font-serif text-xl font-semibold">
              {stats?.pendingOrders ?? "—"} orders
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
          <span className="grid size-11 place-items-center rounded-full bg-destructive/15 text-destructive">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Low stock</p>
            <p className="font-serif text-xl font-semibold">
              {stats?.lowStock ?? "—"} products
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-medium">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {!stats || stats.recentOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No orders yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-accent/40"
                >
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer} · {formatDate(order.createdAt)}
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

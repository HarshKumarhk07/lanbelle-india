import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Package, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserOrders } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatPrice, formatDate } from "@/lib/utils";
import type { OrderDTO } from "@/types";

export const metadata: Metadata = { title: "My orders" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  const { page } = await searchParams;

  let orders: OrderDTO[] = [];
  let totalPages = 1;
  let currentPage = 1;
  try {
    const result = await listUserOrders(user!.id, Number(page) || 1, 10);
    orders = result.items;
    totalPages = result.pagination.totalPages;
    currentPage = result.pagination.page;
  } catch {
    /* DB unavailable */
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-accent/60 text-primary">
          <Package className="size-7" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold">No orders yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            When you place an order, it will appear here.
          </p>
        </div>
        <Button asChild>
          <Link href="/shop">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="font-medium">{order.orderNumber}</p>
              <p className="text-xs text-muted-foreground">
                Placed {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <span className="font-semibold">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex -space-x-3">
              {order.items.slice(0, 4).map((item) => (
                <div
                  key={item.productId}
                  className="relative size-12 overflow-hidden rounded-lg border-2 border-card bg-muted"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ))}
              {order.items.length > 4 && (
                <div className="grid size-12 place-items-center rounded-lg border-2 border-card bg-accent text-xs font-medium">
                  +{order.items.length - 4}
                </div>
              )}
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/account/orders/${order.id}`}>
                View details <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {currentPage > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/account/orders?page=${currentPage - 1}`}>
                Previous
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/account/orders?page=${currentPage + 1}`}>Next</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

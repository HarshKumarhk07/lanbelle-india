"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShoppingCart, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { FieldInput } from "@/components/admin/form-fields";
import { apiGet, apiPatch } from "@/lib/api-client";
import { getErrorMessage, formatPrice, formatDate, cn } from "@/lib/utils";
import type { AdminOrderRow } from "@/services/admin.service";
import type { OrderStatus, Paginated } from "@/types";

const STATUSES = [
  "all",
  "pending",
  "paid",
  "processing",
  "dispatched",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = React.useState<string>("all");
  const [editing, setEditing] = React.useState<AdminOrderRow | null>(null);

  const KEY = ["admin", "orders", status] as const;
  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () =>
      apiGet<Paginated<AdminOrderRow>>(`/admin/orders?status=${status}`),
  });
  const orders = data?.items ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Orders</h1>

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
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
          <ShoppingCart className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(o.createdAt)} · {o.itemCount} item(s)
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{o.customer}</p>
                      <p className="text-xs text-muted-foreground">{o.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">
                      {o.paymentMethod} · {o.paymentStatus}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Update status"
                        onClick={() => setEditing(o)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UpdateDialog
        order={editing}
        onClose={() => setEditing(null)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: KEY })}
      />
    </div>
  );
}

function UpdateDialog({
  order,
  onClose,
  onSaved,
}: {
  order: AdminOrderRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = React.useState<OrderStatus>("processing");
  const [tracking, setTracking] = React.useState("");
  const [carrier, setCarrier] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTracking("");
      setCarrier("");
    }
  }, [order]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSaving(true);
    try {
      await apiPatch(`/admin/orders/${order.id}`, {
        status,
        trackingNumber: tracking || undefined,
        carrier: carrier || undefined,
      });
      toast.success("Order updated");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(order)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update {order?.orderNumber}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/30"
            >
              {["pending", "paid", "processing", "dispatched", "delivered", "cancelled", "refunded"].map(
                (s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ),
              )}
            </select>
          </div>
          <FieldInput label="Tracking number (optional)" value={tracking} onChange={setTracking} />
          <FieldInput label="Carrier (optional)" value={carrier} onChange={setCarrier} />
          <Button type="submit" size="lg" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save update
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

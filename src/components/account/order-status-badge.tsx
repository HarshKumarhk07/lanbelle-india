import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";

const config: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "success" | "gold" | "outline" }
> = {
  pending: { label: "Pending", variant: "outline" },
  paid: { label: "Paid", variant: "gold" },
  processing: { label: "Processing", variant: "gold" },
  dispatched: { label: "Dispatched", variant: "default" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "secondary" },
  refunded: { label: "Refunded", variant: "secondary" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}

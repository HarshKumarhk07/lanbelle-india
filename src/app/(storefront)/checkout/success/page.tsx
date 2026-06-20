import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderSuccess } from "@/components/checkout/order-success";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-px mx-auto max-w-2xl py-16">
          <Skeleton className="mx-auto h-64 w-full" />
        </div>
      }
    >
      <OrderSuccess />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Securely complete your Lanbel order.",
};

export default function CheckoutPage() {
  return (
    <div className="container-px mx-auto max-w-7xl py-12">
      <h1 className="font-serif text-3xl font-semibold">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Authentic Korean skincare, shipped from South Korea.
      </p>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}

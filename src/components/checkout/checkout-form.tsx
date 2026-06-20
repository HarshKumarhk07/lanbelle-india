"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegister, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Lock,
  Plane,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { apiPost } from "@/lib/api-client";
import { getErrorMessage, cn, formatPrice } from "@/lib/utils";
import { shippingNotice } from "@/lib/site-config";
import {
  checkoutFormSchema,
  type CheckoutFormInput,
} from "@/lib/validations/checkout";
import type { OrderDTO } from "@/types";

interface CreateOrderResponse {
  order: OrderDTO;
  requiresPayment: boolean;
  razorpay?: { orderId: string; amount: number; keyId: string };
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, totals, couponCode, clearCart } = useCart();
  const { user } = useAuth();
  const [processing, setProcessing] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingAddress: {
        fullName: user?.name ?? "",
        country: "India",
      } as CheckoutFormInput["shippingAddress"],
      billingSameAsShipping: true,
      paymentMethod: "razorpay",
      shippingConsent: false,
    },
  });

  const billingSame = watch("billingSameAsShipping");
  const paymentMethod = watch("paymentMethod");

  const placeOrder = handleSubmit(async (values) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setProcessing(true);
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress: values.shippingAddress,
        billingSameAsShipping: values.billingSameAsShipping,
        billingAddress: values.billingSameAsShipping
          ? undefined
          : values.billingAddress,
        paymentMethod: values.paymentMethod,
        couponCode: couponCode ?? undefined,
        shippingConsent: true as const,
      };

      const res = await apiPost<CreateOrderResponse>("/orders", payload);

      if (!res.requiresPayment || !res.razorpay) {
        clearCart();
        router.push(`/checkout/success?order=${res.order.id}`);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Could not load the payment gateway. Please try again.");
        setProcessing(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: res.razorpay.keyId,
        amount: res.razorpay.amount,
        currency: "INR",
        name: "Lanbel",
        description: `Order ${res.order.orderNumber}`,
        order_id: res.razorpay.orderId,
        prefill: {
          name: values.shippingAddress.fullName,
          email: user?.email,
          contact: values.shippingAddress.phone,
        },
        theme: { color: "#c2566b" },
        modal: { ondismiss: () => setProcessing(false) },
        handler: async (response) => {
          try {
            await apiPost("/payments/verify", {
              orderId: res.order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            router.push(`/checkout/success?order=${res.order.id}`);
          } catch (error) {
            toast.error(getErrorMessage(error));
            setProcessing(false);
          }
        },
      });
      rzp.open();
    } catch (error) {
      toast.error(getErrorMessage(error));
      setProcessing(false);
    }
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="font-serif text-2xl font-semibold">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">
          Add products before checking out.
        </p>
        <Button asChild>
          <Link href="/shop">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={placeOrder}
      className="grid gap-8 lg:grid-cols-[1fr_400px]"
      noValidate
    >
      <div className="space-y-8">
        {/* Shipping address */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg font-semibold">Shipping address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <AddressFields
              prefix="shippingAddress"
              register={register}
              errors={
                errors.shippingAddress as
                  | Record<string, FieldError>
                  | undefined
              }
            />
          </div>
        </section>

        {/* Billing */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg font-semibold">Billing address</h2>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-border accent-primary"
              {...register("billingSameAsShipping")}
            />
            Same as shipping address
          </label>
          {!billingSame && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <AddressFields
                prefix="billingAddress"
                register={register}
                errors={
                  errors.billingAddress as
                    | Record<string, FieldError>
                    | undefined
                }
              />
            </div>
          )}
        </section>

        {/* Payment method */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg font-semibold">Payment method</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <PaymentOption
              value="razorpay"
              selected={paymentMethod === "razorpay"}
              register={register}
              icon={<CreditCard className="size-5" />}
              title="Pay online"
              desc="UPI · Cards · Net banking"
            />
            <PaymentOption
              value="cod"
              selected={paymentMethod === "cod"}
              register={register}
              icon={<Banknote className="size-5" />}
              title="Cash on delivery"
              desc="Pay when it arrives"
            />
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg font-semibold">Order summary</h2>

          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {item.quantity}
                  </span>
                </div>
                <span className="line-clamp-2 flex-1 text-sm">{item.name}</span>
                <span className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount{couponCode ? ` (${couponCode})` : ""}</dt>
                <dd>– {formatPrice(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>
                {totals.shippingFee === 0
                  ? "Free"
                  : formatPrice(totals.shippingFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(totals.total)}</dd>
            </div>
          </dl>
        </div>

        {/* International shipping notice + consent */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 font-medium">
            <Plane className="size-5 text-primary" /> International shipping
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {shippingNotice.confirmation}
          </p>
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
              {...register("shippingConsent")}
            />
            <span>{shippingNotice.consent}</span>
          </label>
          {errors.shippingConsent && (
            <p className="mt-2 text-xs text-destructive">
              {errors.shippingConsent.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={processing}>
          {processing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Lock className="size-4" />
          )}
          {paymentMethod === "cod"
            ? "Place order"
            : `Pay ${formatPrice(totals.total)}`}
        </Button>

        <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-success" /> 100% authentic, secure
            payments
          </p>
          <p className="flex items-center gap-2">
            <Truck className="size-4 text-primary" /> Free shipping over{" "}
            {formatPrice(1499)}
          </p>
        </div>
      </aside>
    </form>
  );
}

type AddressPrefix = "shippingAddress" | "billingAddress";

function AddressFields({
  prefix,
  register,
  errors,
}: {
  prefix: AddressPrefix;
  register: UseFormRegister<CheckoutFormInput>;
  errors?: Partial<Record<string, FieldError>>;
}) {
  const field = (name: string) =>
    `${prefix}.${name}` as unknown as keyof CheckoutFormInput;

  return (
    <>
      <Field label="Full name" error={errors?.fullName} className="sm:col-span-2">
        <Input placeholder="Full name" {...register(field("fullName"))} />
      </Field>
      <Field label="Phone" error={errors?.phone}>
        <Input placeholder="Phone number" {...register(field("phone"))} />
      </Field>
      <Field label="Pincode" error={errors?.pincode}>
        <Input placeholder="6-digit pincode" {...register(field("pincode"))} />
      </Field>
      <Field
        label="Address line 1"
        error={errors?.line1}
        className="sm:col-span-2"
      >
        <Input placeholder="House no, street" {...register(field("line1"))} />
      </Field>
      <Field
        label="Address line 2 (optional)"
        error={errors?.line2}
        className="sm:col-span-2"
      >
        <Input
          placeholder="Area, landmark"
          {...register(field("line2"))}
        />
      </Field>
      <Field label="City" error={errors?.city}>
        <Input placeholder="City" {...register(field("city"))} />
      </Field>
      <Field label="State" error={errors?.state}>
        <Input placeholder="State" {...register(field("state"))} />
      </Field>
      <Field label="Country" error={errors?.country}>
        <Input placeholder="Country" {...register(field("country"))} />
      </Field>
    </>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: FieldError;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}

function PaymentOption({
  value,
  selected,
  register,
  icon,
  title,
  desc,
}: {
  value: "razorpay" | "cod";
  selected: boolean;
  register: UseFormRegister<CheckoutFormInput>;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40",
      )}
    >
      <input
        type="radio"
        value={value}
        className="sr-only"
        {...register("paymentMethod")}
      />
      <span
        className={cn(
          "grid size-10 place-items-center rounded-full",
          selected ? "bg-primary text-primary-foreground" : "bg-accent text-primary",
        )}
      >
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </label>
  );
}

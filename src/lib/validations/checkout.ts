import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Name is required").max(80).trim(),
  phone: z
    .string()
    .min(8, "Enter a valid phone number")
    .max(15)
    .regex(/^[0-9+\-\s]+$/, "Enter a valid phone number")
    .trim(),
  line1: z.string().min(3, "Address is required").max(160).trim(),
  line2: z.string().max(160).trim().optional().or(z.literal("")),
  city: z.string().min(2, "City is required").max(80).trim(),
  state: z.string().min(2, "State is required").max(80).trim(),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  country: z.string().min(2).default("India"),
});

export const checkoutSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().min(1).max(20),
        }),
      )
      .min(1, "Your cart is empty"),
    shippingAddress: addressSchema,
    billingSameAsShipping: z.boolean().default(true),
    billingAddress: addressSchema.optional(),
    paymentMethod: z.enum(["razorpay", "cod"]),
    couponCode: z.string().trim().toUpperCase().optional().or(z.literal("")),
    shippingConsent: z.literal(true, {
      errorMap: () => ({
        message:
          "Please acknowledge the international shipping timeline to continue.",
      }),
    }),
  })
  .refine(
    (data) => data.billingSameAsShipping || !!data.billingAddress,
    {
      message: "Billing address is required",
      path: ["billingAddress"],
    },
  );

/** Client form schema (cart items are injected at submit time). */
export const checkoutFormSchema = z
  .object({
    shippingAddress: addressSchema,
    billingSameAsShipping: z.boolean().default(true),
    billingAddress: addressSchema.partial().optional(),
    paymentMethod: z.enum(["razorpay", "cod"]),
    shippingConsent: z.boolean().refine((v) => v === true, {
      message:
        "Please acknowledge the international shipping timeline to continue.",
    }),
  })
  .refine(
    (data) =>
      data.billingSameAsShipping ||
      (data.billingAddress &&
        addressSchema.safeParse(data.billingAddress).success),
    { message: "Please complete the billing address", path: ["billingAddress"] },
  );

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

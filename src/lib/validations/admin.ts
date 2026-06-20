import { z } from "zod";

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().default(""),
  publicId: z.string().optional(),
});

const stringList = z.array(z.string().trim().min(1)).default([]);

export const adminProductSchema = z.object({
  name: z.string().min(2).max(160).trim(),
  sku: z.string().min(2).max(40).trim(),
  description: z.string().min(10),
  shortDescription: z.string().max(300).trim().optional().or(z.literal("")),
  brand: z.string().min(1, "Select a brand"),
  category: z.string().min(1, "Select a category"),
  images: z.array(imageSchema).min(1, "Add at least one image"),
  price: z.coerce.number().min(0),
  mrp: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(8),
  tags: stringList,
  ingredients: stringList,
  howToUse: stringList,
  benefits: stringList,
  skinTypes: z
    .array(
      z.enum([
        "all",
        "oily",
        "dry",
        "combination",
        "sensitive",
        "normal",
        "acne-prone",
      ]),
    )
    .default(["all"]),
  volume: z.string().trim().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const adminCategorySchema = z.object({
  name: z.string().min(2).max(80).trim(),
  slug: z.string().trim().optional().or(z.literal("")),
  description: z.string().max(500).trim().optional().or(z.literal("")),
  icon: z.string().trim().optional().or(z.literal("")),
  image: imageSchema.optional(),
  order: z.coerce.number().int().default(0),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const adminBrandSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  description: z.string().max(800).trim().optional().or(z.literal("")),
  logo: imageSchema.optional(),
  country: z.string().default("South Korea"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const adminCouponSchema = z.object({
  code: z.string().min(3).max(24).trim().toUpperCase(),
  description: z.string().max(200).trim().optional().or(z.literal("")),
  type: z.enum(["percentage", "fixed", "free_shipping"]),
  value: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().int().min(0).optional(),
  perUserLimit: z.coerce.number().int().min(0).default(1),
  startsAt: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const adminBannerSchema = z.object({
  title: z.string().min(2).max(120).trim(),
  subtitle: z.string().max(200).trim().optional().or(z.literal("")),
  image: imageSchema,
  mobileImage: imageSchema.optional(),
  ctaLabel: z.string().max(40).trim().optional().or(z.literal("")),
  ctaHref: z.string().max(200).trim().optional().or(z.literal("")),
  position: z.enum(["hero", "promo", "category", "checkout"]).default("promo"),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "paid",
    "processing",
    "dispatched",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  trackingNumber: z.string().trim().optional().or(z.literal("")),
  carrier: z.string().trim().optional().or(z.literal("")),
  note: z.string().trim().optional().or(z.literal("")),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
export type AdminCategoryInput = z.infer<typeof adminCategorySchema>;
export type AdminBrandInput = z.infer<typeof adminBrandSchema>;
export type AdminCouponInput = z.infer<typeof adminCouponSchema>;
export type AdminBannerInput = z.infer<typeof adminBannerSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

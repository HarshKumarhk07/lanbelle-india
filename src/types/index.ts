import type { ApiResponse } from "@/lib/api-response";

export type { ApiResponse };

export type Role = "user" | "admin";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  isEmailVerified: boolean;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "razorpay" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface ProductImage {
  url: string;
  alt: string;
  publicId?: string;
}

export interface SelectedLocation {
  label: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  mrp: number;
  quantity: number;
  stock: number;
}

export interface CartDTO {
  items: CartLine[];
  couponCode?: string;
  couponDiscount: number;
  couponValid: boolean;
}

export type ProductBadge = "best" | "featured" | "new" | "trending";

/** Lightweight product shape used by cards/grids (storefront listings). */
export interface ProductCardDTO {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: number;
  mrp: number;
  rating: number;
  reviewCount: number;
  image: string;
  badges: ProductBadge[];
  stock: number;
}

/** Full product shape used on the product detail page. */
export interface ProductDetailDTO extends ProductCardDTO {
  sku: string;
  brandSlug: string;
  description: string;
  shortDescription?: string;
  images: ProductImage[];
  ingredients: string[];
  howToUse: string[];
  benefits: string[];
  skinTypes: string[];
  volume?: string;
  countryOfOrigin: string;
  discountPercent: number;
  inStock: boolean;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  productCount?: number;
}

export interface BrandDTO {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  country: string;
}

export interface OrderItemDTO {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  mrp: number;
  quantity: number;
  subtotal: number;
}

export interface NotificationDTO {
  id: string;
  type: "order" | "shipping" | "promo" | "account" | "system";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReviewDTO {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  userName: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  product?: { id: string; name: string; slug: string; image: string };
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  items: OrderItemDTO[];
  shippingAddress: Address;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  couponCode?: string;
  estimatedDeliveryMinDays: number;
  estimatedDeliveryMaxDays: number;
  trackingNumber?: string;
  createdAt: string;
}

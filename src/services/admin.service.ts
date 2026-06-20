import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";
import { Order } from "@/models/order.model";
import { User } from "@/models/user.model";
import { Coupon } from "@/models/coupon.model";
import { Banner } from "@/models/banner.model";
import { Review } from "@/models/review.model";
import { ApiError, HttpStatus } from "@/lib/api-response";
import { deleteImage } from "@/lib/cloudinary";
import { createNotification } from "@/services/notification.service";
import { buildPagination, resolvePaging } from "@/utils/pagination";
import type {
  AdminCouponInput,
  AdminBannerInput,
  UpdateOrderStatusInput,
} from "@/lib/validations/admin";
import type { OrderStatus, Paginated, Role } from "@/types";

// --------------------------- Dashboard ---------------------------

export interface DashboardStats {
  revenue: number;
  orderCount: number;
  productCount: number;
  userCount: number;
  pendingOrders: number;
  lowStock: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: OrderStatus;
    createdAt: string;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectDB();
  const [
    revenueAgg,
    orderCount,
    productCount,
    userCount,
    pendingOrders,
    lowStock,
    recent,
  ] = await Promise.all([
    Order.aggregate<{ total: number }>([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: "user" }),
    Order.countDocuments({ status: { $in: ["pending", "paid", "processing"] } }),
    Product.countDocuments({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate({ path: "user", select: "name" })
      .lean(),
  ]);

  return {
    revenue: revenueAgg[0]?.total ?? 0,
    orderCount,
    productCount,
    userCount,
    pendingOrders,
    lowStock,
    recentOrders: recent.map((o) => ({
      id: String(o._id),
      orderNumber: o.orderNumber,
      customer:
        typeof o.user === "object" && o.user && "name" in o.user
          ? (o.user as { name: string }).name
          : "Guest",
      total: o.total,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
  };
}

// --------------------------- Orders ---------------------------

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  total: number;
  itemCount: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

export async function listAdminOrders(
  status?: string,
  page?: number,
  limit?: number,
): Promise<Paginated<AdminOrderRow>> {
  await connectDB();
  const paging = resolvePaging(page, limit ?? 20);
  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(paging.skip)
      .limit(paging.limit)
      .populate({ path: "user", select: "name email" })
      .lean(),
    Order.countDocuments(filter),
  ]);

  const items: AdminOrderRow[] = orders.map((o) => {
    const u = o.user as { name?: string; email?: string } | null;
    return {
      id: String(o._id),
      orderNumber: o.orderNumber,
      customer: u?.name ?? "Guest",
      email: u?.email ?? "",
      total: o.total,
      itemCount: o.items.length,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt.toISOString(),
    };
  });

  return { items, pagination: buildPagination(total, paging.page, paging.limit) };
}

export async function updateOrderStatus(
  orderId: string,
  input: UpdateOrderStatusInput,
): Promise<void> {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError("Order not found", HttpStatus.NOT_FOUND);

  order.status = input.status;
  if (input.trackingNumber) order.trackingNumber = input.trackingNumber;
  if (input.carrier) order.carrier = input.carrier;
  if (input.status === "dispatched" && !order.dispatchedAt) {
    order.dispatchedAt = new Date();
  }
  if (input.status === "delivered" && !order.deliveredAt) {
    order.deliveredAt = new Date();
  }
  order.statusHistory.push({
    status: input.status,
    note: input.note || undefined,
    at: new Date(),
  });
  await order.save();

  await createNotification({
    userId: String(order.user),
    type: input.status === "dispatched" ? "shipping" : "order",
    title: `Order ${order.orderNumber} ${input.status}`,
    message:
      input.status === "dispatched" && input.trackingNumber
        ? `Your order is on the way. Tracking: ${input.trackingNumber}`
        : `Your order status is now "${input.status}".`,
    link: `/account/orders/${order._id}`,
  }).catch(() => {});
}

// --------------------------- Users ---------------------------

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  provider: string;
  createdAt: string;
}

export async function listAdminUsers(
  search?: string,
  page?: number,
  limit?: number,
): Promise<Paginated<AdminUserRow>> {
  await connectDB();
  const paging = resolvePaging(page, limit ?? 20);
  const filter: Record<string, unknown> = {};
  if (search?.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(paging.skip)
      .limit(paging.limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  const items: AdminUserRow[] = users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    isEmailVerified: u.isEmailVerified,
    provider: u.provider,
    createdAt: u.createdAt.toISOString(),
  }));

  return { items, pagination: buildPagination(total, paging.page, paging.limit) };
}

export async function setUserActive(
  userId: string,
  isActive: boolean,
): Promise<void> {
  await connectDB();
  await User.findByIdAndUpdate(userId, { isActive });
}

export async function setUserRole(userId: string, role: Role): Promise<void> {
  await connectDB();
  await User.findByIdAndUpdate(userId, { role });
}

// --------------------------- Reviews moderation ---------------------------

export interface AdminReviewRow {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  status: string;
  userName: string;
  productName: string;
  createdAt: string;
}

export async function listAdminReviews(
  status?: string,
  page?: number,
  limit?: number,
): Promise<Paginated<AdminReviewRow>> {
  await connectDB();
  const paging = resolvePaging(page, limit ?? 20);
  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(paging.skip)
      .limit(paging.limit)
      .populate({ path: "user", select: "name" })
      .populate({ path: "product", select: "name" })
      .lean(),
    Review.countDocuments(filter),
  ]);

  const items: AdminReviewRow[] = reviews.map((r) => ({
    id: String(r._id),
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    status: r.status,
    userName: (r.user as { name?: string })?.name ?? "User",
    productName: (r.product as { name?: string })?.name ?? "Product",
    createdAt: r.createdAt.toISOString(),
  }));

  return { items, pagination: buildPagination(total, paging.page, paging.limit) };
}

export async function setReviewStatus(
  reviewId: string,
  status: "approved" | "rejected",
): Promise<void> {
  await connectDB();
  const review = await Review.findByIdAndUpdate(reviewId, { status });
  if (review) await Review.recalculateProductRating(review.product);
}

export async function deleteReviewAdmin(reviewId: string): Promise<void> {
  await connectDB();
  const review = await Review.findByIdAndDelete(reviewId);
  if (review) await Review.recalculateProductRating(review.product);
}

// --------------------------- Coupons ---------------------------

export interface AdminCouponRow {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderAmount: number;
  usedCount: number;
  usageLimit?: number;
  expiresAt?: string;
  isActive: boolean;
}

export async function listAdminCoupons(): Promise<AdminCouponRow[]> {
  await connectDB();
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return coupons.map((c) => ({
    id: String(c._id),
    code: c.code,
    type: c.type,
    value: c.value,
    minOrderAmount: c.minOrderAmount,
    usedCount: c.usedCount,
    usageLimit: c.usageLimit,
    expiresAt: c.expiresAt?.toISOString(),
    isActive: c.isActive,
  }));
}

function couponPayload(input: AdminCouponInput) {
  return {
    ...input,
    startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
  };
}

export async function createCoupon(input: AdminCouponInput): Promise<void> {
  await connectDB();
  await Coupon.create(couponPayload(input));
}

export async function updateCoupon(
  id: string,
  input: AdminCouponInput,
): Promise<void> {
  await connectDB();
  const updated = await Coupon.findByIdAndUpdate(id, couponPayload(input), {
    runValidators: true,
  });
  if (!updated) throw new ApiError("Coupon not found", HttpStatus.NOT_FOUND);
}

export async function deleteCoupon(id: string): Promise<void> {
  await connectDB();
  await Coupon.findByIdAndDelete(id);
}

// --------------------------- Banners ---------------------------

export interface AdminBannerRow {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  position: string;
  order: number;
  isActive: boolean;
}

export async function listAdminBanners(): Promise<AdminBannerRow[]> {
  await connectDB();
  const banners = await Banner.find().sort({ position: 1, order: 1 }).lean();
  return banners.map((b) => ({
    id: String(b._id),
    title: b.title,
    subtitle: b.subtitle,
    image: b.image?.url ?? "",
    position: b.position,
    order: b.order,
    isActive: b.isActive,
  }));
}

export async function createBanner(input: AdminBannerInput): Promise<void> {
  await connectDB();
  await Banner.create(input);
}

export async function updateBanner(
  id: string,
  input: AdminBannerInput,
): Promise<void> {
  await connectDB();
  const updated = await Banner.findByIdAndUpdate(id, input, {
    runValidators: true,
  });
  if (!updated) throw new ApiError("Banner not found", HttpStatus.NOT_FOUND);
}

export async function deleteBanner(id: string): Promise<void> {
  await connectDB();
  const banner = await Banner.findByIdAndDelete(id);
  if (banner?.image?.publicId) {
    await deleteImage(banner.image.publicId).catch(() => {});
  }
}

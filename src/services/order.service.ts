import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";
import { Order, type IOrder } from "@/models/order.model";
import { ApiError, HttpStatus } from "@/lib/api-response";
import { computeTotals } from "@/utils/pricing";
import { createRazorpayOrder } from "@/lib/razorpay";
import { validateCoupon, recordCouponUsage } from "@/services/coupon.service";
import { sendOrderConfirmationEmail } from "@/services/email.service";
import { buildPagination, resolvePaging } from "@/utils/pagination";
import type { CheckoutInput } from "@/lib/validations/checkout";
import type {
  CartLine,
  OrderDTO,
  Paginated,
  PaymentMethod,
} from "@/types";

interface OrderUser {
  id: string;
  email: string;
  name: string;
}

export interface CreateOrderResult {
  order: OrderDTO;
  requiresPayment: boolean;
  razorpay?: { orderId: string; amount: number; keyId: string };
}

function serializeOrder(order: IOrder): OrderDTO {
  return {
    id: String(order._id),
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    items: order.items.map((i) => ({
      productId: String(i.product),
      slug: i.slug,
      name: i.name,
      brand: i.brand,
      image: i.image,
      price: i.price,
      mrp: i.mrp,
      quantity: i.quantity,
      subtotal: i.subtotal,
    })),
    shippingAddress: {
      fullName: order.shippingAddress.fullName,
      phone: order.shippingAddress.phone,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
      country: order.shippingAddress.country,
    },
    subtotal: order.subtotal,
    discount: order.discount,
    shippingFee: order.shippingFee,
    tax: order.tax,
    total: order.total,
    couponCode: order.couponCode,
    estimatedDeliveryMinDays: order.estimatedDeliveryMinDays,
    estimatedDeliveryMaxDays: order.estimatedDeliveryMaxDays,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt.toISOString(),
  };
}

async function decrementStock(
  items: { product: string; quantity: number }[],
): Promise<void> {
  await Promise.all(
    items.map((i) =>
      Product.updateOne(
        { _id: i.product },
        { $inc: { stock: -i.quantity, unitsSold: i.quantity } },
      ),
    ),
  );
}

/** Creates an order, validating prices/stock server-side. */
export async function createOrder(
  user: OrderUser,
  input: CheckoutInput,
): Promise<CreateOrderResult> {
  await connectDB();

  const ids = input.items.map((i) => i.productId);
  const products = await Product.find({
    _id: { $in: ids },
    isActive: true,
    isPublished: true,
  })
    .populate({ path: "brand", select: "name" })
    .lean();

  if (products.length === 0) {
    throw new ApiError("No valid products in your order", HttpStatus.BAD_REQUEST);
  }

  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const lines: CartLine[] = [];
  const orderItems = [];

  for (const requested of input.items) {
    const product = productMap.get(requested.productId);
    if (!product) {
      throw new ApiError(
        "One or more products are no longer available",
        HttpStatus.BAD_REQUEST,
      );
    }
    if (product.stock < requested.quantity) {
      throw new ApiError(
        `${product.name} has only ${product.stock} left in stock`,
        HttpStatus.CONFLICT,
      );
    }
    const brand =
      typeof product.brand === "object" && product.brand && "name" in product.brand
        ? (product.brand as { name: string }).name
        : "";
    const image = product.images[0]?.url ?? "";
    const subtotal = product.price * requested.quantity;

    lines.push({
      productId: requested.productId,
      slug: product.slug,
      name: product.name,
      image,
      price: product.price,
      mrp: product.mrp,
      quantity: requested.quantity,
      stock: product.stock,
    });
    orderItems.push({
      product: requested.productId,
      name: product.name,
      slug: product.slug,
      brand,
      image,
      price: product.price,
      mrp: product.mrp,
      quantity: requested.quantity,
      subtotal,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  let couponDiscount = 0;
  let appliedCoupon: string | undefined;
  if (input.couponCode) {
    const result = await validateCoupon(input.couponCode, user.id, subtotal);
    if (result.valid) {
      couponDiscount = result.discount;
      appliedCoupon = result.code;
    }
  }

  const totals = computeTotals(lines, couponDiscount);

  const billing =
    input.billingSameAsShipping || !input.billingAddress
      ? input.shippingAddress
      : input.billingAddress;

  const order = await Order.create({
    user: user.id,
    items: orderItems,
    shippingAddress: input.shippingAddress,
    billingAddress: billing,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shippingFee: totals.shippingFee,
    tax: totals.tax,
    total: totals.total,
    couponCode: appliedCoupon,
    paymentMethod: input.paymentMethod,
    paymentStatus: "pending",
    status: "pending",
    shippingConsent: input.shippingConsent,
    statusHistory: [{ status: "pending", note: "Order created", at: new Date() }],
  });

  // Cash on delivery: confirm immediately and reserve stock.
  if (input.paymentMethod === "cod") {
    order.status = "processing";
    order.statusHistory.push({
      status: "processing",
      note: "Cash on delivery confirmed",
      at: new Date(),
    });
    await order.save();
    await decrementStock(orderItems.map((i) => ({ product: i.product, quantity: i.quantity })));
    if (appliedCoupon) await recordCouponUsage(appliedCoupon, user.id);
    await sendOrderConfirmationEmail(user, serializeOrder(order)).catch(() => {});
    return { order: serializeOrder(order), requiresPayment: false };
  }

  // Razorpay: create gateway order.
  const rzpOrder = await createRazorpayOrder(totals.total, order.orderNumber);
  order.razorpayOrderId = rzpOrder.id;
  await order.save();

  return {
    order: serializeOrder(order),
    requiresPayment: true,
    razorpay: {
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      keyId:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ??
        process.env.RAZORPAY_KEY_ID ??
        "",
    },
  };
}

/** Marks a Razorpay order paid (idempotent). Signature must be pre-verified. */
export async function markOrderPaid(
  user: OrderUser,
  params: { orderId: string; razorpayPaymentId: string; razorpaySignature: string },
): Promise<OrderDTO> {
  await connectDB();
  const order = await Order.findOne({ _id: params.orderId, user: user.id });
  if (!order) throw new ApiError("Order not found", HttpStatus.NOT_FOUND);

  if (order.paymentStatus === "paid") return serializeOrder(order);

  order.paymentStatus = "paid";
  order.status = "processing";
  order.paidAt = new Date();
  order.razorpayPaymentId = params.razorpayPaymentId;
  order.razorpaySignature = params.razorpaySignature;
  order.statusHistory.push({
    status: "paid",
    note: "Payment received",
    at: new Date(),
  });
  await order.save();

  await decrementStock(
    order.items.map((i) => ({ product: String(i.product), quantity: i.quantity })),
  );
  if (order.couponCode) await recordCouponUsage(order.couponCode, user.id);
  await sendOrderConfirmationEmail(user, serializeOrder(order)).catch(() => {});

  return serializeOrder(order);
}

/** Webhook-driven paid marker (idempotent), keyed by Razorpay order id. */
export async function markPaidByRazorpayOrder(
  razorpayOrderId: string,
  razorpayPaymentId: string,
): Promise<void> {
  await connectDB();
  const order = await Order.findOne({ razorpayOrderId });
  if (!order || order.paymentStatus === "paid") return;

  order.paymentStatus = "paid";
  order.status = "processing";
  order.paidAt = new Date();
  order.razorpayPaymentId = razorpayPaymentId;
  order.statusHistory.push({ status: "paid", note: "Payment captured (webhook)", at: new Date() });
  await order.save();
  await decrementStock(
    order.items.map((i) => ({ product: String(i.product), quantity: i.quantity })),
  );
  if (order.couponCode) await recordCouponUsage(order.couponCode, String(order.user));
}

/** Marks an order refunded (webhook/admin). */
export async function markOrderRefunded(
  razorpayOrderId: string,
  refundId?: string,
): Promise<void> {
  await connectDB();
  const order = await Order.findOne({ razorpayOrderId });
  if (!order || order.paymentStatus === "refunded") return;
  order.paymentStatus = "refunded";
  order.status = "refunded";
  order.refundId = refundId;
  order.refundedAt = new Date();
  order.statusHistory.push({ status: "refunded", note: "Payment refunded", at: new Date() });
  await order.save();
}

export async function getUserOrder(
  userId: string,
  orderId: string,
): Promise<OrderDTO | null> {
  await connectDB();
  const order = await Order.findOne({ _id: orderId, user: userId });
  return order ? serializeOrder(order) : null;
}

export async function listUserOrders(
  userId: string,
  page?: number,
  limit?: number,
): Promise<Paginated<OrderDTO>> {
  await connectDB();
  const paging = resolvePaging(page, limit ?? 10);
  const [orders, total] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(paging.skip)
      .limit(paging.limit),
    Order.countDocuments({ user: userId }),
  ]);
  return {
    items: orders.map(serializeOrder),
    pagination: buildPagination(total, paging.page, paging.limit),
  };
}

export type { PaymentMethod };

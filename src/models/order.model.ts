import { Schema, type Document, type Types } from "mongoose";
import { registerModel } from "@/models/_registry";
import { AddressSchema, type IAddress } from "@/models/_shared";
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  slug: string;
  brand: string;
  image: string;
  price: number;
  mrp: number;
  quantity: number;
  subtotal: number;
}

export interface IStatusHistory {
  status: OrderStatus;
  note?: string;
  at: Date;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];

  shippingAddress: IAddress;
  billingAddress?: IAddress;

  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  couponCode?: string;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: Date;
  refundId?: string;
  refundedAt?: Date;

  status: OrderStatus;
  statusHistory: IStatusHistory[];

  /** International-shipping consent acknowledged at checkout. */
  shippingConsent: boolean;
  estimatedDeliveryMinDays: number;
  estimatedDeliveryMaxDays: number;

  carrier?: string;
  trackingNumber?: string;
  dispatchedAt?: Date;
  deliveredAt?: Date;

  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    brand: { type: String, default: "" },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: { type: [orderItemSchema], required: true },

    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: { type: AddressSchema },

    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    couponCode: { type: String, uppercase: true, trim: true },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paidAt: { type: Date },
    refundId: { type: String },
    refundedAt: { type: Date },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "dispatched",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },
    statusHistory: {
      type: [
        new Schema<IStatusHistory>(
          {
            status: { type: String, required: true },
            note: { type: String },
            at: { type: Date, default: Date.now },
          },
          { _id: false },
        ),
      ],
      default: [],
    },

    shippingConsent: { type: Boolean, required: true, default: false },
    estimatedDeliveryMinDays: { type: Number, default: 7 },
    estimatedDeliveryMaxDays: { type: Number, default: 21 },

    carrier: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    dispatchedAt: { type: Date },
    deliveredAt: { type: Date },

    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

orderSchema.pre("validate", function (next) {
  if (!this.orderNumber) {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.floor(Math.random() * 1296)
      .toString(36)
      .toUpperCase()
      .padStart(2, "0");
    this.orderNumber = `LB-${stamp}-${rand}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });

export const Order = registerModel<IOrder>("Order", orderSchema);

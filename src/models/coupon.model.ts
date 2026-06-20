import { Schema, type Document, type Types } from "mongoose";
import { registerModel } from "@/models/_registry";

export type CouponType = "percentage" | "fixed" | "free_shipping";
export type CouponScope = "all" | "category" | "product";

export interface ICouponUsage {
  user: Types.ObjectId;
  count: number;
}

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  scope: CouponScope;
  targetCategories: Types.ObjectId[];
  targetProducts: Types.ObjectId[];
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  usedBy: Types.DocumentArray<ICouponUsage>;
  startsAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping"],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    scope: {
      type: String,
      enum: ["all", "category", "product"],
      default: "all",
    },
    targetCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    targetProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    usageLimit: { type: Number, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 1, min: 0 },
    usedBy: {
      type: [
        new Schema<ICouponUsage>(
          {
            user: { type: Schema.Types.ObjectId, ref: "User", required: true },
            count: { type: Number, default: 0 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    startsAt: { type: Date },
    expiresAt: { type: Date, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Coupon = registerModel<ICoupon>("Coupon", couponSchema);

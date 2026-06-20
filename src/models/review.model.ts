import {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";
import { registerModel } from "@/models/_registry";
import { ImageSchema, type IImage } from "@/models/_shared";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface IReview extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  user: Types.ObjectId;
  order?: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images: IImage[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewModel extends Model<IReview> {
  recalculateProductRating(productId: Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 120 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    images: { type: [ImageSchema], default: [] },
    isVerifiedPurchase: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    helpfulCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// One review per user per product.
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.statics.recalculateProductRating = async function (
  this: Model<IReview>,
  productId: Types.ObjectId,
): Promise<void> {
  const [stats] = await this.aggregate<{ avg: number; count: number }>([
    { $match: { product: productId, status: "approved" } },
    {
      $group: {
        _id: "$product",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const { Product } = await import("@/models/product.model");
  await Product.findByIdAndUpdate(productId, {
    ratingAverage: stats ? Math.round(stats.avg * 10) / 10 : 0,
    ratingCount: stats ? stats.count : 0,
  });
};

reviewSchema.post("save", function (doc) {
  (doc.constructor as ReviewModel).recalculateProductRating(doc.product);
});

reviewSchema.post("findOneAndDelete", function (doc: IReview | null) {
  if (doc) {
    (doc.constructor as ReviewModel).recalculateProductRating(doc.product);
  }
});

export const Review = registerModel<IReview>("Review", reviewSchema) as ReviewModel;

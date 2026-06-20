import { Schema, type Document, type Types } from "mongoose";
import { registerModel } from "@/models/_registry";
import { ImageSchema, SeoSchema, type IImage, type ISeo } from "@/models/_shared";
import { slugify } from "@/lib/utils";

export type SkinType =
  | "all"
  | "oily"
  | "dry"
  | "combination"
  | "sensitive"
  | "normal"
  | "acne-prone";

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  brand: Types.ObjectId;
  category: Types.ObjectId;
  tags: string[];
  images: IImage[];

  price: number;
  mrp: number;
  currency: string;

  stock: number;
  lowStockThreshold: number;

  ingredients: string[];
  howToUse: string[];
  benefits: string[];
  skinTypes: SkinType[];
  volume?: string;
  countryOfOrigin: string;

  ratingAverage: number;
  ratingCount: number;
  unitsSold: number;

  isFeatured: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  isActive: boolean;

  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;

  // virtuals
  discountPercent: number;
  inStock: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String, trim: true, maxlength: 300 },

    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    tags: { type: [String], default: [], index: true },
    images: {
      type: [ImageSchema],
      validate: {
        validator: (v: IImage[]) => v.length > 0,
        message: "At least one product image is required",
      },
    },

    price: { type: Number, required: true, min: 0, index: true },
    mrp: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },

    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 8, min: 0 },

    ingredients: { type: [String], default: [] },
    howToUse: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    skinTypes: {
      type: [String],
      enum: ["all", "oily", "dry", "combination", "sensitive", "normal", "acne-prone"],
      default: ["all"],
    },
    volume: { type: String, trim: true },
    countryOfOrigin: { type: String, default: "South Korea", trim: true },

    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    unitsSold: { type: Number, default: 0, min: 0 },

    isFeatured: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },

    seo: { type: SeoSchema },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.virtual("discountPercent").get(function (this: IProduct) {
  if (!this.mrp || this.mrp <= this.price) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

productSchema.virtual("inStock").get(function (this: IProduct) {
  return this.stock > 0;
});

productSchema.pre("validate", function (next) {
  if (this.name && !this.slug) this.slug = slugify(this.name);
  if (this.mrp < this.price) this.mrp = this.price;
  next();
});

// Full-text search across name, brand-agnostic fields and tags.
productSchema.index({ name: "text", description: "text", tags: "text" });
// Common storefront sort/filter combinations.
productSchema.index({ isPublished: 1, isActive: 1, createdAt: -1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ ratingAverage: -1, ratingCount: -1 });

export const Product = registerModel<IProduct>("Product", productSchema);

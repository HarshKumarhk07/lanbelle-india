import { Schema, type Document, type Types } from "mongoose";
import { registerModel } from "@/models/_registry";
import { ImageSchema, type IImage } from "@/models/_shared";

export type BannerPosition = "hero" | "promo" | "category" | "checkout";

export interface IBanner extends Document {
  _id: Types.ObjectId;
  title: string;
  subtitle?: string;
  image: IImage;
  mobileImage?: IImage;
  ctaLabel?: string;
  ctaHref?: string;
  position: BannerPosition;
  order: number;
  isActive: boolean;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    image: { type: ImageSchema, required: true },
    mobileImage: { type: ImageSchema },
    ctaLabel: { type: String, trim: true },
    ctaHref: { type: String, trim: true },
    position: {
      type: String,
      enum: ["hero", "promo", "category", "checkout"],
      default: "hero",
      index: true,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { timestamps: true },
);

export const Banner = registerModel<IBanner>("Banner", bannerSchema);

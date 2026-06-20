import { Schema, type Document, type Types } from "mongoose";
import { registerModel } from "@/models/_registry";
import { ImageSchema, SeoSchema, type IImage, type ISeo } from "@/models/_shared";
import { slugify } from "@/lib/utils";

export interface IBrand extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  logo?: IImage;
  country: string;
  isActive: boolean;
  isFeatured: boolean;
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true, maxlength: 800 },
    logo: { type: ImageSchema },
    country: { type: String, default: "South Korea", trim: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    seo: { type: SeoSchema },
  },
  { timestamps: true },
);

brandSchema.pre("validate", function (next) {
  if (this.name && !this.slug) this.slug = slugify(this.name);
  next();
});

export const Brand = registerModel<IBrand>("Brand", brandSchema);

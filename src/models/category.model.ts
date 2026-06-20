import { Schema, type Document, type Types } from "mongoose";
import { registerModel } from "@/models/_registry";
import { ImageSchema, SeoSchema, type IImage, type ISeo } from "@/models/_shared";
import { slugify } from "@/lib/utils";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: IImage;
  parent?: Types.ObjectId | null;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true, maxlength: 500 },
    icon: { type: String, trim: true },
    image: { type: ImageSchema },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    seo: { type: SeoSchema },
  },
  { timestamps: true },
);

categorySchema.pre("validate", function (next) {
  if (this.name && !this.slug) this.slug = slugify(this.name);
  next();
});

categorySchema.index({ name: "text", description: "text" });

export const Category = registerModel<ICategory>("Category", categorySchema);

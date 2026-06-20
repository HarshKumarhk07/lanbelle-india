import { Schema } from "mongoose";

/** Reusable embedded sub-schemas shared across models. */

export interface IImage {
  url: string;
  alt: string;
  publicId?: string;
}

export const ImageSchema = new Schema<IImage>(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, default: "", trim: true },
    publicId: { type: String, trim: true },
  },
  { _id: false },
);

export interface IAddress {
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

export const AddressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: "India", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

export interface ISeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export const SeoSchema = new Schema<ISeo>(
  {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: { type: [String], default: [] },
  },
  { _id: false },
);

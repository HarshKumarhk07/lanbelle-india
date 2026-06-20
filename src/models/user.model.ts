import { Schema, type Document, type Model, type Types } from "mongoose";
import bcrypt from "bcryptjs";
import { registerModel } from "@/models/_registry";
import { AddressSchema, type IAddress } from "@/models/_shared";
import type { Role } from "@/types";

export type AuthProvider = "credentials" | "google";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatar?: string;
  phone?: string;

  provider: AuthProvider;
  googleId?: string;

  isEmailVerified: boolean;
  isActive: boolean;

  addresses: Types.DocumentArray<IAddress>;
  /** Bumped to invalidate all previously-issued refresh tokens. */
  tokenVersion: number;

  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<IUser>;

const userSchema = new Schema<IUser, UserModel>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, select: false, minlength: 8 },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    avatar: { type: String, trim: true },
    phone: { type: String, trim: true },

    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    googleId: { type: String, index: true, sparse: true },

    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    addresses: { type: [AddressSchema], default: [] },
    tokenVersion: { type: Number, default: 0 },

    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// Ensure a single default address per user.
userSchema.pre("save", function (next) {
  if (this.isModified("addresses")) {
    const defaults = this.addresses.filter((a) => a.isDefault);
    if (defaults.length > 1) {
      this.addresses.forEach((a, i) => {
        a.isDefault = i === this.addresses.length - 1 ? a.isDefault : false;
      });
    }
  }
  next();
});

export const User = registerModel<IUser>("User", userSchema) as UserModel;

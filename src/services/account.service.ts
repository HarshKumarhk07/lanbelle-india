import { connectDB } from "@/lib/db";
import { User } from "@/models/user.model";
import { ApiError, HttpStatus } from "@/lib/api-response";
import type { IAddress } from "@/models/_shared";
import type { Address, SessionUser } from "@/types";
import type { AddressInput } from "@/lib/validations/checkout";
import type { ProfileInput } from "@/lib/validations/account";

function serializeAddress(a: IAddress & { _id?: unknown }): Address {
  return {
    _id: a._id ? String(a._id) : undefined,
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    country: a.country,
    isDefault: a.isDefault,
  };
}

export async function listAddresses(userId: string): Promise<Address[]> {
  await connectDB();
  const user = await User.findById(userId).select("addresses").lean();
  if (!user) throw new ApiError("User not found", HttpStatus.NOT_FOUND);
  return (user.addresses ?? []).map((a) => serializeAddress(a as IAddress));
}

export async function addAddress(
  userId: string,
  input: AddressInput & { isDefault?: boolean },
): Promise<Address[]> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", HttpStatus.NOT_FOUND);

  const makeDefault = input.isDefault || user.addresses.length === 0;
  if (makeDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push({ ...input, isDefault: makeDefault } as IAddress);
  await user.save();
  return user.addresses.map((a) => serializeAddress(a));
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: Partial<AddressInput> & { isDefault?: boolean },
): Promise<Address[]> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", HttpStatus.NOT_FOUND);

  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError("Address not found", HttpStatus.NOT_FOUND);

  if (input.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  address.set({ ...input });
  await user.save();
  return user.addresses.map((a) => serializeAddress(a));
}

export async function deleteAddress(
  userId: string,
  addressId: string,
): Promise<Address[]> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", HttpStatus.NOT_FOUND);

  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError("Address not found", HttpStatus.NOT_FOUND);

  const wasDefault = address.isDefault;
  address.deleteOne();
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0]!.isDefault = true;
  }
  await user.save();
  return user.addresses.map((a) => serializeAddress(a));
}

export async function setDefaultAddress(
  userId: string,
  addressId: string,
): Promise<Address[]> {
  return updateAddress(userId, addressId, { isDefault: true });
}

export async function updateProfile(
  userId: string,
  input: ProfileInput,
): Promise<SessionUser> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", HttpStatus.NOT_FOUND);

  user.name = input.name;
  if (input.phone !== undefined) user.phone = input.phone || undefined;
  await user.save();

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    isEmailVerified: user.isEmailVerified,
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await connectDB();
  const user = await User.findById(userId).select("+password");
  if (!user) throw new ApiError("User not found", HttpStatus.NOT_FOUND);

  if (!user.password) {
    throw new ApiError(
      "Your account uses Google sign-in and has no password to change.",
      HttpStatus.BAD_REQUEST,
    );
  }

  const valid = await user.comparePassword(currentPassword);
  if (!valid) {
    throw new ApiError("Current password is incorrect", HttpStatus.BAD_REQUEST);
  }

  user.password = newPassword;
  await user.save();
}

import { type NextRequest } from "next/server";
import { updateAddress, deleteAddress } from "@/services/account.service";
import { addressSchema } from "@/lib/validations/checkout";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const updateAddressSchema = addressSchema
  .partial()
  .extend({ isDefault: z.boolean().optional() });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const input = updateAddressSchema.parse(body);
    const addresses = await updateAddress(user.id, id, input);
    return success({ addresses }, "Address updated");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const addresses = await deleteAddress(user.id, id);
    return success({ addresses }, "Address removed");
  } catch (error) {
    return handleApiError(error);
  }
}

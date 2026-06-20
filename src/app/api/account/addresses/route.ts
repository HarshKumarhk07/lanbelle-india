import { type NextRequest } from "next/server";
import { listAddresses, addAddress } from "@/services/account.service";
import { addressSchema } from "@/lib/validations/checkout";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError, HttpStatus } from "@/lib/api-response";
import { z } from "zod";

const createAddressSchema = addressSchema.extend({
  isDefault: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const addresses = await listAddresses(user.id);
    return success({ addresses }, "Addresses fetched");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const input = createAddressSchema.parse(body);
    const addresses = await addAddress(user.id, input);
    return success({ addresses }, "Address added", {
      status: HttpStatus.CREATED,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

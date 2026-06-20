import { type NextRequest } from "next/server";
import { listAdminBrands, createBrand } from "@/services/catalog-admin.service";
import { adminBrandSchema } from "@/lib/validations/admin";
import { requireAdmin } from "@/lib/auth/session";
import { success, handleApiError, HttpStatus } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const brands = await listAdminBrands();
    return success({ brands }, "Brands fetched");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const input = adminBrandSchema.parse(body);
    await createBrand(input);
    return success(null, "Brand created", { status: HttpStatus.CREATED });
  } catch (error) {
    return handleApiError(error);
  }
}

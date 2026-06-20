import { type NextRequest } from "next/server";
import { listAdminProducts, createProduct } from "@/services/catalog-admin.service";
import { adminProductSchema } from "@/lib/validations/admin";
import { requireAdmin } from "@/lib/auth/session";
import { success, handleApiError, HttpStatus } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;
    const result = await listAdminProducts(
      searchParams.get("search") ?? undefined,
      Number(searchParams.get("page")) || 1,
      Number(searchParams.get("limit")) || 20,
    );
    return success(result, "Products fetched");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const input = adminProductSchema.parse(body);
    const id = await createProduct(input);
    return success({ id }, "Product created", { status: HttpStatus.CREATED });
  } catch (error) {
    return handleApiError(error);
  }
}

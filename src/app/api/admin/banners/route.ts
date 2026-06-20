import { type NextRequest } from "next/server";
import { listAdminBanners, createBanner } from "@/services/admin.service";
import { adminBannerSchema } from "@/lib/validations/admin";
import { requireAdmin } from "@/lib/auth/session";
import { success, handleApiError, HttpStatus } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const banners = await listAdminBanners();
    return success({ banners }, "Banners fetched");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const input = adminBannerSchema.parse(body);
    await createBanner(input);
    return success(null, "Banner created", { status: HttpStatus.CREATED });
  } catch (error) {
    return handleApiError(error);
  }
}

import { type NextRequest } from "next/server";
import { setUserActive, setUserRole } from "@/services/admin.service";
import { requireAdmin } from "@/lib/auth/session";
import { success, failure, handleApiError, HttpStatus } from "@/lib/api-response";
import { z } from "zod";

const schema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    if (id === admin.id) {
      return failure("You cannot modify your own account here", HttpStatus.BAD_REQUEST);
    }
    const body = await req.json().catch(() => ({}));
    const input = schema.parse(body);
    if (input.isActive !== undefined) await setUserActive(id, input.isActive);
    if (input.role) await setUserRole(id, input.role);
    return success(null, "User updated");
  } catch (error) {
    return handleApiError(error);
  }
}

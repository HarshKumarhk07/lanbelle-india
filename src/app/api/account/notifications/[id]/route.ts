import { type NextRequest } from "next/server";
import { markNotificationRead } from "@/services/notification.service";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await markNotificationRead(user.id, id);
    return success(null, "Marked as read");
  } catch (error) {
    return handleApiError(error);
  }
}

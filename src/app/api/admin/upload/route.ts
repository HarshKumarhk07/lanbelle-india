import { type NextRequest } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/auth/session";
import { success, failure, handleApiError, HttpStatus } from "@/lib/api-response";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const form = await req.formData();
    const file = form.get("file");
    const folder = form.get("folder");

    if (!(file instanceof File)) {
      return failure("No file provided", HttpStatus.BAD_REQUEST);
    }
    if (!ALLOWED.includes(file.type)) {
      return failure("Unsupported file type", HttpStatus.UNPROCESSABLE);
    }
    if (file.size > MAX_BYTES) {
      return failure("Image must be under 5MB", HttpStatus.UNPROCESSABLE);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
    const result = await uploadImage(
      dataUri,
      typeof folder === "string" ? folder : undefined,
    );

    return success(
      { url: result.url, publicId: result.publicId },
      "Image uploaded",
      { status: HttpStatus.CREATED },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

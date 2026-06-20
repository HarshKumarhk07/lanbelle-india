import { v2 as cloudinary } from "cloudinary";
import { getServerEnv } from "@/lib/env";
import { ApiError, HttpStatus } from "@/lib/api-response";

let configured = false;

function configure() {
  if (configured) return;
  const env = getServerEnv();
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw new ApiError(
      "Image uploads are not configured.",
      HttpStatus.INTERNAL,
    );
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/** Uploads an image (data URI or remote URL) to the configured folder. */
export async function uploadImage(
  dataUri: string,
  folder?: string,
): Promise<UploadResult> {
  configure();
  const env = getServerEnv();
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: folder ?? env.CLOUDINARY_UPLOAD_FOLDER,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  configure();
  await cloudinary.uploader.destroy(publicId);
}

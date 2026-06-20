"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { cn, getErrorMessage } from "@/lib/utils";
import type { ProductImage } from "@/types";

async function uploadToCloudinary(file: File): Promise<ProductImage> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? "Upload failed");
  return { url: json.data.url, publicId: json.data.publicId, alt: "" };
}

interface ImageUploadProps {
  value: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  multiple?: boolean;
  max?: number;
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  max = 6,
}: ImageUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const slots = multiple ? max - value.length : 1;
    const selected = Array.from(files).slice(0, Math.max(0, slots));
    if (selected.length === 0) {
      toast.error(`You can upload up to ${max} images`);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(selected.map(uploadToCloudinary));
      onChange(multiple ? [...value, ...uploaded] : uploaded);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (publicId?: string, url?: string) => {
    onChange(value.filter((img) => (img.publicId ?? img.url) !== (publicId ?? url)));
  };

  const canAdd = multiple ? value.length < max : value.length === 0;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((img) => (
          <div
            key={img.publicId ?? img.url}
            className="relative size-24 overflow-hidden rounded-xl border border-border bg-muted"
          >
            <Image
              src={img.url}
              alt={img.alt || "Uploaded image"}
              fill
              sizes="96px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => remove(img.publicId, img.url)}
              aria-label="Remove image"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-foreground/70 text-background transition hover:bg-destructive"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "grid size-24 place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : value.length === 0 ? (
              <span className="flex flex-col items-center gap-1 text-xs">
                <ImagePlus className="size-5" /> Upload
              </span>
            ) : (
              <Upload className="size-5" />
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        PNG, JPG, WEBP or AVIF · up to 5MB{multiple ? ` · max ${max} images` : ""}
      </p>
    </div>
  );
}

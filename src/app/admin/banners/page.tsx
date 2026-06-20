"use client";

import * as React from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/admin/image-upload";
import { Two, FieldInput, Check } from "@/components/admin/form-fields";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";
import type { ProductImage } from "@/types";
import type { AdminBannerRow } from "@/services/admin.service";

const KEY = ["admin", "banners"] as const;

interface FormState {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  position: "hero" | "promo" | "category" | "checkout";
  order: string;
  isActive: boolean;
  image?: ProductImage;
}

const empty: FormState = {
  title: "",
  subtitle: "",
  ctaLabel: "",
  ctaHref: "",
  position: "promo",
  order: "0",
  isActive: true,
};

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(empty);
  const [saving, setSaving] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () => apiGet<{ banners: AdminBannerRow[] }>("/admin/banners"),
  });
  const banners = data?.banners ?? [];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) {
      toast.error("Add a banner image");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        ctaLabel: form.ctaLabel,
        ctaHref: form.ctaHref,
        position: form.position,
        order: Number(form.order),
        isActive: form.isActive,
        image: form.image,
      };
      if (editId) await apiPatch(`/admin/banners/${editId}`, payload);
      else await apiPost("/admin/banners", payload);
      toast.success(editId ? "Banner updated" : "Banner created");
      queryClient.invalidateQueries({ queryKey: KEY });
      setOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await apiDelete(`/admin/banners/${id}`);
      toast.success("Banner deleted");
      queryClient.invalidateQueries({ queryKey: KEY });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Banners</h1>
        <Button
          onClick={() => {
            setEditId(null);
            setForm(empty);
            setOpen(true);
          }}
        >
          <Plus className="size-4" /> New banner
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
          <ImageIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No banners yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {banners.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-[16/7] bg-muted">
                {b.image && (
                  <Image src={b.image} alt={b.title} fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover" />
                )}
                <Badge className="absolute left-3 top-3 capitalize">{b.position}</Badge>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{b.title}</p>
                  {b.subtitle && (
                    <p className="truncate text-xs text-muted-foreground">{b.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={b.isActive ? "success" : "secondary"}>
                    {b.isActive ? "Live" : "Off"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit"
                    onClick={() => {
                      setEditId(b.id);
                      setForm({
                        title: b.title,
                        subtitle: b.subtitle ?? "",
                        ctaLabel: "",
                        ctaHref: "",
                        position: b.position as FormState["position"],
                        order: String(b.order),
                        isActive: b.isActive,
                        image: { url: b.image, alt: b.title },
                      });
                      setOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(b.id, b.title)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit banner" : "New banner"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Image</Label>
              <ImageUpload
                value={form.image ? [form.image] : []}
                onChange={(imgs) => setForm((f) => ({ ...f, image: imgs[0] }))}
              />
            </div>
            <FieldInput label="Title" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} required />
            <FieldInput label="Subtitle" value={form.subtitle} onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))} />
            <Two>
              <FieldInput label="CTA label" value={form.ctaLabel} onChange={(v) => setForm((f) => ({ ...f, ctaLabel: v }))} />
              <FieldInput label="CTA link" value={form.ctaHref} onChange={(v) => setForm((f) => ({ ...f, ctaHref: v }))} placeholder="/shop" />
            </Two>
            <Two>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Position</Label>
                <select
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value as FormState["position"] }))}
                  className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/30"
                >
                  <option value="hero">Hero</option>
                  <option value="promo">Promo</option>
                  <option value="category">Category</option>
                  <option value="checkout">Checkout</option>
                </select>
              </div>
              <FieldInput label="Order" type="number" value={form.order} onChange={(v) => setForm((f) => ({ ...f, order: v }))} />
            </Two>
            <Check label="Active" checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
            <Button type="submit" size="lg" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editId ? "Save changes" : "Create banner"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

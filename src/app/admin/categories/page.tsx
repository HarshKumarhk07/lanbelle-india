"use client";

import * as React from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, FolderTree } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/admin/image-upload";
import { Two, FieldInput, Check } from "@/components/admin/form-fields";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";
import type { ProductImage } from "@/types";
import type { AdminCategoryRow } from "@/services/catalog-admin.service";

const KEY = ["admin", "categories"] as const;

interface FormState {
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: string;
  isFeatured: boolean;
  isActive: boolean;
  image?: ProductImage;
}

const empty: FormState = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  order: "0",
  isFeatured: false,
  isActive: true,
};

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(empty);
  const [saving, setSaving] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () => apiGet<{ categories: AdminCategoryRow[] }>("/admin/categories"),
  });
  const categories = data?.categories ?? [];

  const openNew = () => {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (c: AdminCategoryRow) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      icon: "",
      order: String(c.order),
      isFeatured: c.isFeatured,
      isActive: c.isActive,
      image: c.image ? { url: c.image, alt: c.name } : undefined,
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description,
        icon: form.icon,
        order: Number(form.order),
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        image: form.image,
      };
      if (editId) await apiPatch(`/admin/categories/${editId}`, payload);
      else await apiPost("/admin/categories", payload);
      toast.success(editId ? "Category updated" : "Category created");
      queryClient.invalidateQueries({ queryKey: KEY });
      setOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await apiDelete(`/admin/categories/${id}`);
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: KEY });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Categories</h1>
        <Button onClick={openNew}>
          <Plus className="size-4" /> New category
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : categories.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {c.image && (
                    <Image src={c.image} alt={c.name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.productCount} products
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {c.isFeatured && <Badge variant="gold">Featured</Badge>}
                <Badge variant={c.isActive ? "success" : "secondary"}>
                  {c.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
                <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(c.id, c.name)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Image</Label>
              <ImageUpload
                value={form.image ? [form.image] : []}
                onChange={(imgs) => setForm((f) => ({ ...f, image: imgs[0] }))}
              />
            </div>
            <Two>
              <FieldInput label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
              <FieldInput label="Slug (optional)" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} />
            </Two>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <Two>
              <FieldInput label="Icon name" value={form.icon} onChange={(v) => setForm((f) => ({ ...f, icon: v }))} />
              <FieldInput label="Order" type="number" value={form.order} onChange={(v) => setForm((f) => ({ ...f, order: v }))} />
            </Two>
            <div className="flex gap-4">
              <Check label="Featured" checked={form.isFeatured} onChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))} />
              <Check label="Active" checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
            </div>
            <Button type="submit" size="lg" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editId ? "Save changes" : "Create category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
      <FolderTree className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No categories yet</p>
    </div>
  );
}

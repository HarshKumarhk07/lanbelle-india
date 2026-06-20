"use client";

import * as React from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react";
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
import type { AdminBrandRow } from "@/services/catalog-admin.service";

const KEY = ["admin", "brands"] as const;

interface FormState {
  name: string;
  description: string;
  country: string;
  isFeatured: boolean;
  isActive: boolean;
  logo?: ProductImage;
}

const empty: FormState = {
  name: "",
  description: "",
  country: "South Korea",
  isFeatured: false,
  isActive: true,
};

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(empty);
  const [saving, setSaving] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () => apiGet<{ brands: AdminBrandRow[] }>("/admin/brands"),
  });
  const brands = data?.brands ?? [];

  const openEdit = (b: AdminBrandRow) => {
    setEditId(b.id);
    setForm({
      name: b.name,
      description: b.description ?? "",
      country: b.country,
      isFeatured: b.isFeatured,
      isActive: b.isActive,
      logo: b.logo ? { url: b.logo, alt: b.name } : undefined,
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (editId) await apiPatch(`/admin/brands/${editId}`, payload);
      else await apiPost("/admin/brands", payload);
      toast.success(editId ? "Brand updated" : "Brand created");
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
      await apiDelete(`/admin/brands/${id}`);
      toast.success("Brand deleted");
      queryClient.invalidateQueries({ queryKey: KEY });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Brands</h1>
        <Button
          onClick={() => {
            setEditId(null);
            setForm(empty);
            setOpen(true);
          }}
        >
          <Plus className="size-4" /> New brand
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : brands.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
          <Tag className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No brands yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <div key={b.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted text-sm font-semibold">
                  {b.logo ? (
                    <Image src={b.logo} alt={b.name} fill sizes="48px" className="object-cover" />
                  ) : (
                    b.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.country}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {b.isFeatured && <Badge variant="gold">Featured</Badge>}
                <Badge variant={b.isActive ? "success" : "secondary"}>
                  {b.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
                <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(b.id, b.name)}
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
            <DialogTitle>{editId ? "Edit brand" : "New brand"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Logo</Label>
              <ImageUpload
                value={form.logo ? [form.logo] : []}
                onChange={(imgs) => setForm((f) => ({ ...f, logo: imgs[0] }))}
              />
            </div>
            <Two>
              <FieldInput label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
              <FieldInput label="Country" value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} />
            </Two>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-4">
              <Check label="Featured" checked={form.isFeatured} onChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))} />
              <Check label="Active" checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
            </div>
            <Button type="submit" size="lg" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editId ? "Save changes" : "Create brand"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

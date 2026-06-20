"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/image-upload";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";
import { getErrorMessage, cn } from "@/lib/utils";
import type { ProductImage } from "@/types";
import type { AdminBrandRow, AdminCategoryRow } from "@/services/catalog-admin.service";

const SKIN_TYPES = [
  "all",
  "oily",
  "dry",
  "combination",
  "sensitive",
  "normal",
  "acne-prone",
] as const;

const FLAGS = [
  { key: "isFeatured", label: "Featured" },
  { key: "isBestSeller", label: "Best seller" },
  { key: "isTrending", label: "Trending" },
  { key: "isNewArrival", label: "New arrival" },
  { key: "isPublished", label: "Published" },
  { key: "isActive", label: "Active" },
] as const;

interface FormState {
  name: string;
  sku: string;
  description: string;
  shortDescription: string;
  brand: string;
  category: string;
  images: ProductImage[];
  price: string;
  mrp: string;
  stock: string;
  lowStockThreshold: string;
  volume: string;
  tags: string;
  ingredients: string;
  howToUse: string;
  benefits: string;
  skinTypes: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  isActive: boolean;
}

const initialState: FormState = {
  name: "",
  sku: "",
  description: "",
  shortDescription: "",
  brand: "",
  category: "",
  images: [],
  price: "",
  mrp: "",
  stock: "0",
  lowStockThreshold: "8",
  volume: "",
  tags: "",
  ingredients: "",
  howToUse: "",
  benefits: "",
  skinTypes: ["all"],
  isFeatured: false,
  isBestSeller: false,
  isTrending: false,
  isNewArrival: false,
  isPublished: true,
  isActive: true,
};

const toLines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(initialState);
  const [saving, setSaving] = React.useState(false);

  const { data: brandsData } = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: () => apiGet<{ brands: AdminBrandRow[] }>("/admin/brands"),
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => apiGet<{ categories: AdminCategoryRow[] }>("/admin/categories"),
  });

  const { data: productData, isLoading } = useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: () => apiGet<{ product: Record<string, unknown> }>(`/admin/products/${productId}`),
    enabled: Boolean(productId),
  });

  React.useEffect(() => {
    if (!productData?.product) return;
    const p = productData.product as Record<string, unknown>;
    setForm({
      name: String(p.name ?? ""),
      sku: String(p.sku ?? ""),
      description: String(p.description ?? ""),
      shortDescription: String(p.shortDescription ?? ""),
      brand: String(p.brand ?? ""),
      category: String(p.category ?? ""),
      images: (p.images as ProductImage[]) ?? [],
      price: String(p.price ?? ""),
      mrp: String(p.mrp ?? ""),
      stock: String(p.stock ?? "0"),
      lowStockThreshold: String(p.lowStockThreshold ?? "8"),
      volume: String(p.volume ?? ""),
      tags: ((p.tags as string[]) ?? []).join("\n"),
      ingredients: ((p.ingredients as string[]) ?? []).join("\n"),
      howToUse: ((p.howToUse as string[]) ?? []).join("\n"),
      benefits: ((p.benefits as string[]) ?? []).join("\n"),
      skinTypes: (p.skinTypes as string[]) ?? ["all"],
      isFeatured: Boolean(p.isFeatured),
      isBestSeller: Boolean(p.isBestSeller),
      isTrending: Boolean(p.isTrending),
      isNewArrival: Boolean(p.isNewArrival),
      isPublished: Boolean(p.isPublished),
      isActive: Boolean(p.isActive),
    });
  }, [productData]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.images.length === 0) {
      toast.error("Add at least one product image");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        description: form.description,
        shortDescription: form.shortDescription,
        brand: form.brand,
        category: form.category,
        images: form.images,
        price: Number(form.price),
        mrp: Number(form.mrp),
        stock: Number(form.stock),
        lowStockThreshold: Number(form.lowStockThreshold),
        volume: form.volume,
        tags: toLines(form.tags),
        ingredients: toLines(form.ingredients),
        howToUse: toLines(form.howToUse),
        benefits: toLines(form.benefits),
        skinTypes: form.skinTypes.length ? form.skinTypes : ["all"],
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        isTrending: form.isTrending,
        isNewArrival: form.isNewArrival,
        isPublished: form.isPublished,
        isActive: form.isActive,
      };
      if (productId) {
        await apiPatch(`/admin/products/${productId}`, payload);
        toast.success("Product updated");
      } else {
        await apiPost("/admin/products", payload);
        toast.success("Product created");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (productId && isLoading) {
    return <Loader2 className="size-6 animate-spin text-primary" />;
  }

  const brands = brandsData?.brands ?? [];
  const categories = categoriesData?.categories ?? [];

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card title="Basics">
          <Grid>
            <Field label="Name" full>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </Field>
            <Field label="SKU">
              <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} required />
            </Field>
            <Field label="Volume / size">
              <Input value={form.volume} onChange={(e) => set("volume", e.target.value)} placeholder="100ml" />
            </Field>
            <Field label="Short description" full>
              <Input
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
              />
            </Field>
            <Field label="Description" full>
              <Textarea
                className="min-h-28"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                required
              />
            </Field>
          </Grid>
        </Card>

        <Card title="Images">
          <ImageUpload
            value={form.images}
            onChange={(images) => set("images", images)}
            multiple
            max={6}
          />
        </Card>

        <Card title="Details">
          <Grid>
            <Field label="Ingredients (one per line)" full>
              <Textarea value={form.ingredients} onChange={(e) => set("ingredients", e.target.value)} />
            </Field>
            <Field label="How to use (one per line)" full>
              <Textarea value={form.howToUse} onChange={(e) => set("howToUse", e.target.value)} />
            </Field>
            <Field label="Benefits (one per line)" full>
              <Textarea value={form.benefits} onChange={(e) => set("benefits", e.target.value)} />
            </Field>
            <Field label="Tags (one per line)" full>
              <Textarea value={form.tags} onChange={(e) => set("tags", e.target.value)} />
            </Field>
          </Grid>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Organize">
          <div className="grid gap-4">
            <Field label="Brand">
              <Select value={form.brand} onChange={(e) => set("brand", e.target.value)} required>
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Category">
              <Select value={form.category} onChange={(e) => set("category", e.target.value)} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <Card title="Pricing & stock">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₹)">
              <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} required />
            </Field>
            <Field label="MRP (₹)">
              <Input type="number" value={form.mrp} onChange={(e) => set("mrp", e.target.value)} required />
            </Field>
            <Field label="Stock">
              <Input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} required />
            </Field>
            <Field label="Low stock at">
              <Input type="number" value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card title="Skin types">
          <div className="flex flex-wrap gap-2">
            {SKIN_TYPES.map((t) => {
              const active = form.skinTypes.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    set(
                      "skinTypes",
                      active
                        ? form.skinTypes.filter((s) => s !== t)
                        : [...form.skinTypes, t],
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs capitalize transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Visibility">
          <div className="grid gap-2.5">
            {FLAGS.map((flag) => (
              <label key={flag.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={form[flag.key]}
                  onChange={(e) => set(flag.key, e.target.checked)}
                />
                {flag.label}
              </label>
            ))}
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {productId ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 font-medium">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", full && "sm:col-span-2")}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Select(props: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/30"
    />
  );
}

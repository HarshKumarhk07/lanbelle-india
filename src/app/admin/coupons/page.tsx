"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Ticket } from "lucide-react";
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
import { Two, FieldInput, Check } from "@/components/admin/form-fields";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { getErrorMessage, formatPrice, formatDate } from "@/lib/utils";
import type { AdminCouponRow } from "@/services/admin.service";

const KEY = ["admin", "coupons"] as const;

interface FormState {
  code: string;
  description: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  perUserLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

const empty: FormState = {
  code: "",
  description: "",
  type: "percentage",
  value: "10",
  minOrderAmount: "0",
  maxDiscount: "",
  usageLimit: "",
  perUserLimit: "1",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(empty);
  const [saving, setSaving] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () => apiGet<{ coupons: AdminCouponRow[] }>("/admin/coupons"),
  });
  const coupons = data?.coupons ?? [];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        description: form.description,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        perUserLimit: Number(form.perUserLimit),
        startsAt: form.startsAt || undefined,
        expiresAt: form.expiresAt || undefined,
        isActive: form.isActive,
      };
      if (editId) await apiPatch(`/admin/coupons/${editId}`, payload);
      else await apiPost("/admin/coupons", payload);
      toast.success(editId ? "Coupon updated" : "Coupon created");
      queryClient.invalidateQueries({ queryKey: KEY });
      setOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, code: string) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await apiDelete(`/admin/coupons/${id}`);
      toast.success("Coupon deleted");
      queryClient.invalidateQueries({ queryKey: KEY });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const describeValue = (c: AdminCouponRow) =>
    c.type === "percentage"
      ? `${c.value}% off`
      : c.type === "fixed"
        ? `${formatPrice(c.value)} off`
        : "Free shipping";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Coupons</h1>
        <Button
          onClick={() => {
            setEditId(null);
            setForm(empty);
            setOpen(true);
          }}
        >
          <Plus className="size-4" /> New coupon
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
          <Ticket className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No coupons yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Discount</th>
                  <th className="px-4 py-3 font-medium">Min order</th>
                  <th className="px-4 py-3 font-medium">Used</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                    <td className="px-4 py-3">{describeValue(c)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.minOrderAmount ? formatPrice(c.minOrderAmount) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.usedCount}
                      {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.expiresAt ? formatDate(c.expiresAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.isActive ? "success" : "secondary"}>
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit"
                          onClick={() => {
                            setEditId(c.id);
                            setForm({
                              code: c.code,
                              description: "",
                              type: c.type as FormState["type"],
                              value: String(c.value),
                              minOrderAmount: String(c.minOrderAmount),
                              maxDiscount: "",
                              usageLimit: c.usageLimit ? String(c.usageLimit) : "",
                              perUserLimit: "1",
                              startsAt: "",
                              expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
                              isActive: c.isActive,
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
                          onClick={() => remove(c.id, c.code)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit coupon" : "New coupon"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-4">
            <Two>
              <FieldInput label="Code" value={form.code} onChange={(v) => setForm((f) => ({ ...f, code: v.toUpperCase() }))} required />
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FormState["type"] }))}
                  className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/30"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                  <option value="free_shipping">Free shipping</option>
                </select>
              </div>
            </Two>
            <Two>
              <FieldInput label="Value" type="number" value={form.value} onChange={(v) => setForm((f) => ({ ...f, value: v }))} />
              <FieldInput label="Min order (₹)" type="number" value={form.minOrderAmount} onChange={(v) => setForm((f) => ({ ...f, minOrderAmount: v }))} />
            </Two>
            <Two>
              <FieldInput label="Max discount (₹, optional)" type="number" value={form.maxDiscount} onChange={(v) => setForm((f) => ({ ...f, maxDiscount: v }))} />
              <FieldInput label="Usage limit (optional)" type="number" value={form.usageLimit} onChange={(v) => setForm((f) => ({ ...f, usageLimit: v }))} />
            </Two>
            <Two>
              <FieldInput label="Per-user limit" type="number" value={form.perUserLimit} onChange={(v) => setForm((f) => ({ ...f, perUserLimit: v }))} />
              <FieldInput label="Expires at" type="date" value={form.expiresAt} onChange={(v) => setForm((f) => ({ ...f, expiresAt: v }))} />
            </Two>
            <Check label="Active" checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
            <Button type="submit" size="lg" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editId ? "Save changes" : "Create coupon"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin, Pencil, Trash2, Loader2, Check, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { applyApiErrors } from "@/lib/form";
import { getErrorMessage, cn } from "@/lib/utils";
import { addressSchema, type AddressInput } from "@/lib/validations/checkout";
import type { Address } from "@/types";

const KEY = ["account", "addresses"] as const;

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Address | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () => apiGet<{ addresses: Address[] }>("/account/addresses"),
  });

  const addresses = data?.addresses ?? [];

  const refresh = (next: Address[]) =>
    queryClient.setQueryData(KEY, { addresses: next });

  const onDelete = async (id: string) => {
    try {
      const res = await apiDelete<{ addresses: Address[] }>(
        `/account/addresses/${id}`,
      );
      refresh(res.addresses);
      toast.success("Address removed");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onSetDefault = async (id: string) => {
    try {
      const res = await apiPatch<{ addresses: Address[] }>(
        `/account/addresses/${id}`,
        { isDefault: true },
      );
      refresh(res.addresses);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Saved addresses</h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="size-4" /> Add address
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-accent/60 text-primary">
            <MapPin className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No saved addresses yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={cn(
                "rounded-2xl border bg-card p-5",
                address.isDefault ? "border-primary" : "border-border",
              )}
            >
              <div className="flex items-start justify-between">
                <p className="font-medium">{address.fullName}</p>
                {address.isDefault && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <Star className="size-3 fill-primary" /> Default
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                {address.state} {address.pincode}, {address.country}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {address.phone}
              </p>
              <div className="mt-4 flex items-center gap-2">
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetDefault(address._id!)}
                  >
                    <Check className="size-3.5" /> Set default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(address);
                    setOpen(true);
                  }}
                >
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(address._id!)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSaved={refresh}
      />
    </div>
  );
}

function AddressDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Address | null;
  onSaved: (addresses: Address[]) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "India" },
  });

  React.useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              fullName: editing.fullName,
              phone: editing.phone,
              line1: editing.line1,
              line2: editing.line2 ?? "",
              city: editing.city,
              state: editing.state,
              pincode: editing.pincode,
              country: editing.country,
            }
          : { country: "India" } as AddressInput,
      );
    }
  }, [open, editing, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = editing
        ? await apiPatch<{ addresses: Address[] }>(
            `/account/addresses/${editing._id}`,
            values,
          )
        : await apiPost<{ addresses: Address[] }>(
            "/account/addresses",
            values,
          );
      onSaved(res.addresses);
      toast.success(editing ? "Address updated" : "Address added");
      onOpenChange(false);
    } catch (error) {
      toast.error(applyApiErrors(error, setError));
    }
  });

  const field = (name: keyof AddressInput, label: string, full?: boolean) => (
    <div className={cn("grid gap-1.5", full && "sm:col-span-2")}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input {...register(name)} />
      {errors[name] && (
        <p className="text-xs text-destructive">{errors[name]?.message}</p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit address" : "Add address"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          {field("fullName", "Full name", true)}
          {field("phone", "Phone")}
          {field("pincode", "Pincode")}
          {field("line1", "Address line 1", true)}
          {field("line2", "Address line 2 (optional)", true)}
          {field("city", "City")}
          {field("state", "State")}
          {field("country", "Country")}
          <Button
            type="submit"
            className="sm:col-span-2"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {editing ? "Save changes" : "Add address"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

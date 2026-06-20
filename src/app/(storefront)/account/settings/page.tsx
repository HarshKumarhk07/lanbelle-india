"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuth } from "@/context/auth-context";
import { apiPatch, apiPost } from "@/lib/api-client";
import { applyApiErrors } from "@/lib/form";
import {
  profileSchema,
  changePasswordSchema,
  type ProfileInput,
  type ChangePasswordInput,
} from "@/lib/validations/account";
import type { SessionUser } from "@/types";

export default function SettingsPage() {
  const { user, setUser } = useAuth();

  return (
    <div className="space-y-6">
      <ProfileSection user={user} onUpdated={setUser} />
      <PasswordSection />
    </div>
  );
}

function ProfileSection({
  user,
  onUpdated,
}: {
  user: SessionUser | null;
  onUpdated: (user: SessionUser) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? "", phone: user?.phone ?? "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await apiPatch<{ user: SessionUser }>(
        "/account/profile",
        data,
      );
      onUpdated(res.user);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(applyApiErrors(error, setError));
    }
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg font-semibold">Profile</h2>
      <form onSubmit={onSubmit} className="mt-4 grid max-w-lg gap-4" noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email ?? ""} disabled />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="Phone number" {...register("phone")} />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </form>
    </section>
  );
}

function PasswordSection() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await apiPost("/account/password", data);
      toast.success("Password updated");
      reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(applyApiErrors(error, setError));
    }
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg font-semibold">Change password</h2>
      <form onSubmit={onSubmit} className="mt-4 grid max-w-lg gap-4" noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="currentPassword">Current password</Label>
          <PasswordInput
            id="currentPassword"
            autoComplete="current-password"
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p className="text-xs text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-xs text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </section>
  );
}

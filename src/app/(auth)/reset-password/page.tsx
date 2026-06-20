import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your Lanbel account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

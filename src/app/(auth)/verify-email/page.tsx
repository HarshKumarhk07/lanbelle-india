import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyEmailView } from "@/components/auth/verify-email-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verifying your Lanbel account email.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
      <VerifyEmailView />
    </Suspense>
  );
}

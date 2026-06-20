"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import type { SessionUser } from "@/types";

type Status = "verifying" | "success" | "error";

export function VerifyEmailView() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const { setUser } = useAuth();
  const [status, setStatus] = React.useState<Status>("verifying");
  const [message, setMessage] = React.useState("");
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setStatus("error");
      setMessage("This verification link is invalid or incomplete.");
      return;
    }

    apiPost<{ user: SessionUser }>("/auth/verify-email", { token })
      .then(({ user }) => {
        setUser(user);
        setStatus("success");
        toast.success("Email verified — welcome to Lanbel!");
        setTimeout(() => {
          router.replace("/account");
          router.refresh();
        }, 1500);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(getErrorMessage(error));
      });
  }, [token, router, setUser]);

  if (status === "verifying") {
    return (
      <div className="grid gap-4 text-center">
        <Loader2 className="mx-auto size-10 animate-spin text-primary" />
        <h2 className="font-serif text-xl font-semibold">
          Verifying your email…
        </h2>
        <p className="text-sm text-muted-foreground">This will only take a moment.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="grid gap-4 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-7" />
        </div>
        <h2 className="font-serif text-xl font-semibold">Email verified!</h2>
        <p className="text-sm text-muted-foreground">
          Redirecting you to your account…
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <h2 className="font-serif text-xl font-semibold">Verification failed</h2>
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="mt-2 flex flex-col gap-2">
        <Button asChild>
          <Link href="/login">Go to sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register">Create a new account</Link>
        </Button>
      </div>
    </div>
  );
}

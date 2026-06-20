import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Lanbel account to shop authentic Korean skincare.",
};

export default function RegisterPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join Lanbel for authentic K-beauty, delivered.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}

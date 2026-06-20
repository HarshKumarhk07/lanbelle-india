import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AccountSidebar } from "@/components/account/account-sidebar";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="container-px mx-auto max-w-7xl py-10">
      <h1 className="mb-6 font-serif text-3xl font-semibold">My account</h1>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <AccountSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

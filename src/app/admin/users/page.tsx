"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Users, ShieldCheck, ShieldOff, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPatch } from "@/lib/api-client";
import { getErrorMessage, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import type { AdminUserRow } from "@/services/admin.service";
import type { Paginated } from "@/types";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: me } = useAuth();
  const [search, setSearch] = React.useState("");
  const [query, setQuery] = React.useState("");

  const KEY = ["admin", "users", query] as const;
  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () =>
      apiGet<Paginated<AdminUserRow>>(
        `/admin/users?search=${encodeURIComponent(query)}`,
      ),
  });
  const users = data?.items ?? [];

  const mutate = async (id: string, body: Record<string, unknown>) => {
    try {
      await apiPatch(`/admin/users/${id}`, body);
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: KEY });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Users</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(search);
        }}
        className="relative max-w-sm"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email"
          className="pl-10"
        />
      </form>

      {isLoading ? (
        <Skeleton className="h-60" />
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
          <Users className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const isSelf = u.id === me?.id;
                  return (
                    <tr key={u.id} className="hover:bg-accent/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === "admin" ? "gold" : "outline"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.isActive ? "success" : "secondary"}>
                          {u.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSelf}
                            onClick={() =>
                              mutate(u.id, {
                                role: u.role === "admin" ? "user" : "admin",
                              })
                            }
                          >
                            <UserCog className="size-3.5" />
                            {u.role === "admin" ? "Make user" : "Make admin"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={isSelf}
                            aria-label={u.isActive ? "Disable" : "Enable"}
                            className={
                              u.isActive
                                ? "text-muted-foreground hover:text-destructive"
                                : "text-success"
                            }
                            onClick={() => mutate(u.id, { isActive: !u.isActive })}
                          >
                            {u.isActive ? (
                              <ShieldOff className="size-4" />
                            ) : (
                              <ShieldCheck className="size-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

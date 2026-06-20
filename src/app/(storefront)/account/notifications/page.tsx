"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Bell,
  Package,
  Truck,
  Tag,
  UserCog,
  Info,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPatch } from "@/lib/api-client";
import { formatDate, cn, getErrorMessage } from "@/lib/utils";
import type { NotificationDTO } from "@/types";

const KEY = ["account", "notifications"] as const;

const icons = {
  order: Package,
  shipping: Truck,
  promo: Tag,
  account: UserCog,
  system: Info,
} as const;

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () =>
      apiGet<{ notifications: NotificationDTO[]; unread: number }>(
        "/account/notifications",
      ),
  });

  const notifications = data?.notifications ?? [];
  const unread = data?.unread ?? 0;

  const markAll = async () => {
    try {
      await apiPatch("/account/notifications");
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("All marked as read");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const markOne = async (id: string) => {
    try {
      await apiPatch(`/account/notifications/${id}`);
      queryClient.invalidateQueries({ queryKey: KEY });
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">
          Notifications {unread > 0 && `(${unread})`}
        </h2>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={markAll}>
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-accent/60 text-primary">
            <Bell className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => {
            const Icon = icons[n.type];
            const body = (
              <div
                className={cn(
                  "flex gap-3 rounded-2xl border p-4 transition",
                  n.isRead
                    ? "border-border bg-card"
                    : "border-primary/30 bg-primary/5",
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/60 text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.isRead && (
                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
              </div>
            );

            return (
              <li key={n.id} onClick={() => !n.isRead && markOne(n.id)}>
                {n.link ? <Link href={n.link}>{body}</Link> : body}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

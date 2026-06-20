"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiDelete } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";

interface DeleteButtonProps {
  endpoint: string;
  confirmText?: string;
  onDeleted?: () => void;
  label?: string;
}

/** Deletes a resource via API with confirm + refresh. */
export function DeleteButton({
  endpoint,
  confirmText = "Delete this item? This cannot be undone.",
  onDeleted,
  label,
}: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!window.confirm(confirmText)) return;
    setLoading(true);
    try {
      await apiDelete(endpoint);
      toast.success("Deleted");
      onDeleted?.();
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={label ? "sm" : "icon-sm"}
      onClick={handleDelete}
      disabled={loading}
      className="text-muted-foreground hover:text-destructive"
      aria-label="Delete"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
      {label}
    </Button>
  );
}

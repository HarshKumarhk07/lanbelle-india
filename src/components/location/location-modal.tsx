"use client";

import * as React from "react";
import { LocateFixed, MapPin, Search, Hash } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/context/location-context";
import { DEFAULT_PINCODE } from "@/lib/site-config";
import { getErrorMessage } from "@/lib/utils";

/**
 * First-visit location prompt. Location is used purely for shipping estimates,
 * never to restrict products. Free-text search keeps it functional without a
 * Maps API key; Places autocomplete can be layered in later.
 */
export function LocationModal() {
  const {
    isModalOpen,
    closeModal,
    saveLocation,
    detectLocation,
    isDetecting,
  } = useLocation();

  const [query, setQuery] = React.useState("");
  const [pincode, setPincode] = React.useState("");

  const handleConfirm = () => {
    const label = query.trim();
    if (!label) {
      toast.error("Please enter your location to continue.");
      return;
    }
    const cleanPin = pincode.trim();
    if (cleanPin && !/^\d{6}$/.test(cleanPin)) {
      toast.error("Pincode must be 6 digits.");
      return;
    }
    saveLocation({ label, pincode: cleanPin || DEFAULT_PINCODE });
    toast.success("Delivery location saved.");
  };

  const handleDetect = async () => {
    try {
      await detectLocation();
      toast.success("Using your current location.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => !open && closeModal()}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="size-5" />
          </div>
          <DialogTitle>Select your location</DialogTitle>
          <DialogDescription>
            We use this only to estimate shipping times — every product ships
            to all locations.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              placeholder="Search your city, society or area"
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Hash className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={pincode}
              inputMode="numeric"
              maxLength={6}
              onChange={(e) =>
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              placeholder={`Pincode (default: ${DEFAULT_PINCODE})`}
              className="pl-10"
            />
          </div>
          <p className="-mt-1 text-xs text-muted-foreground">
            Leave blank to use default pincode {DEFAULT_PINCODE}.
          </p>

          <button
            type="button"
            onClick={handleDetect}
            disabled={isDetecting}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary transition hover:opacity-80 disabled:opacity-60"
          >
            <LocateFixed
              className={isDetecting ? "size-4 animate-spin" : "size-4"}
            />
            {isDetecting ? "Detecting…" : "Use current location"}
          </button>

          <Button className="mt-1 w-full" size="lg" onClick={handleConfirm}>
            Check availability
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

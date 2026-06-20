"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
  className?: string;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  size = "md",
  className,
}: QuantityStepperProps) {
  const btn =
    size === "sm" ? "size-7" : "size-9";
  const box = size === "sm" ? "w-8 text-sm" : "w-10";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-background",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={cn(
          "grid place-items-center rounded-full text-muted-foreground transition hover:text-foreground disabled:opacity-40",
          btn,
        )}
      >
        <Minus className="size-3.5" />
      </button>
      <span className={cn("text-center font-medium tabular-nums", box)}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={cn(
          "grid place-items-center rounded-full text-muted-foreground transition hover:text-foreground disabled:opacity-40",
          btn,
        )}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

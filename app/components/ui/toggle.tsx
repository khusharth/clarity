"use client";

import * as React from "react";
import * as RadixToggle from "@radix-ui/react-toggle";
import { cn } from "./utils";

export interface ToggleProps extends React.ComponentPropsWithoutRef<typeof RadixToggle.Root> {
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Toggle = React.forwardRef<React.ElementRef<typeof RadixToggle.Root>, ToggleProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background data-state-on:bg-fg data-state-on:text-background";
    const variants = {
      default: "bg-surface hover:bg-surface/80",
      outline: "border border-border bg-transparent hover:bg-surface/60",
    } as const;
    const sizes = {
      sm: "h-8 w-8",
      md: "h-9 w-9",
      lg: "h-10 w-10",
    } as const;

    return (
      <RadixToggle.Root ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
    );
  }
);
Toggle.displayName = "Toggle";

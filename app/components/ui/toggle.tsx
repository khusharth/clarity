"use client";

import * as React from "react";
import * as RadixToggle from "@radix-ui/react-toggle";
import { cn } from "./utils";

export interface ToggleProps extends React.ComponentPropsWithoutRef<typeof RadixToggle.Root> {
  size?: "sm" | "md" | "lg";
}

export const Toggle = React.forwardRef<React.ElementRef<typeof RadixToggle.Root>, ToggleProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizes = {
      sm: "h-6 w-11",
      md: "h-7 w-14",
      lg: "h-8 w-16",
    } as const;
    
    const thumbSizes = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    } as const;
    
    const thumbTranslate = {
      sm: { on: "translate-x-6", off: "translate-x-1" },
      md: { on: "translate-x-7", off: "translate-x-1" },
      lg: { on: "translate-x-8", off: "translate-x-1" },
    } as const;

    return (
      <RadixToggle.Root
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-accent))]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          "data-[state=on]:bg-[rgb(var(--color-accent))] data-[state=off]:bg-[rgb(var(--color-border))]",
          sizes[size],
          className
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block transform rounded-full bg-white shadow transition-transform duration-200 pointer-events-none",
            thumbSizes[size],
            props.pressed ? thumbTranslate[size].on : thumbTranslate[size].off
          )}
        />
      </RadixToggle.Root>
    );
  }
);
Toggle.displayName = "Toggle";

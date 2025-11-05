"use client";

import * as React from "react";
import { cn } from "./utils";

type Variant = "default" | "outline" | "destructive" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background cursor-pointer";
    const variants: Record<Variant, string> = {
      default:
        "bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-fg))]/90",
      accent:
        "bg-[rgb(var(--color-accent))] text-white hover:bg-[rgb(var(--color-accent))]/90",
      outline:
        "border border-[rgb(var(--color-border))] bg-transparent hover:bg-[rgb(var(--color-surface))]/80",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      ghost: "hover:bg-[rgb(var(--color-surface))]/60",
    };
    const sizes: Record<Size, string> = {
      sm: "h-8 px-3 text-sm",
      md: "h-9 px-4",
      lg: "h-10 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

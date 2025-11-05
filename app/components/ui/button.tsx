"use client";

import * as React from "react";
import { cn } from "./utils";

type Variant = "default" | "outline" | "destructive" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";
type ContentType = "both" | "icon-only" | "text-only";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  contentType?: ContentType;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      contentType = "both",
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background cursor-pointer";
    const variants: Record<Variant, string> = {
      default:
        "bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-fg))]/90",
      accent: "bg-[rgb(var(--color-accent))] text-white hover:brightness-110",
      outline:
        "border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:brightness-95",
      destructive:
        "bg-[rgb(var(--color-error))]/90 text-white hover:bg-[rgb(var(--color-error))]/80",
      ghost: "bg-transparent hover:bg-[rgb(var(--color-surface))]/60",
    };

    const isIconOnly = contentType === "icon-only";

    // Base sizes for buttons with text and icon (default)
    const sizes: Record<Size, string> = {
      sm: "h-8 px-3 text-sm gap-1.5",
      md: "h-9 px-4 gap-1",
      lg: "h-10 px-6 text-base gap-1",
    };

    // Icon-only sizing - square with minimal padding
    const iconOnlySizes: Record<Size, string> = {
      sm: "h-8 w-8 p-0",
      md: "h-9 w-9 p-0",
      lg: "h-10 w-10 p-0",
    };
    const sizeClass =
      contentType === "icon-only" ? iconOnlySizes[size] : sizes[size];

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizeClass, className)}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {isIconOnly ? null : children}
      </button>
    );
  }
);
Button.displayName = "Button";

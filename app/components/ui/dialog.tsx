"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "./utils";

const Dialog = RadixDialog.Root;
const DialogTrigger = RadixDialog.Trigger;

function DialogPortal({
  className,
  children,
  ...props
}: RadixDialog.DialogPortalProps & { className?: string }) {
  return (
    <RadixDialog.Portal {...props}>
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center",
          className
        )}
      >
        {children}
      </div>
    </RadixDialog.Portal>
  );
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>) {
  return (
    <RadixDialog.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out",
        className
      )}
      {...props}
    />
  );
}

const DialogClose = RadixDialog.Close;

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Title>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(({ className, ...props }, ref) => (
  <RadixDialog.Title
    ref={ref}
    className={cn("text-xl font-semibold", className)}
    {...props}
  />
));
DialogTitle.displayName = RadixDialog.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Description>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(({ className, ...props }, ref) => (
  <RadixDialog.Description
    ref={ref}
    className={cn("text-sm text-fg-muted", className)}
    {...props}
  />
));
DialogDescription.displayName = RadixDialog.Description.displayName;

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-6 flex justify-end gap-3", className)} {...props} />
  );
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content> & {
    variant?: "dialog" | "bottomsheet";
  }
>(({ className, children, variant = "dialog", ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <RadixDialog.Content
      ref={ref}
      className={cn(
        "fixed z-50 grid w-full max-w-md bg-surface p-6 text-fg rounded-t-xl shadow-soft sm:rounded-xl",
        variant === "dialog"
          ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          : "left-0 right-0 bottom-0",
        className
      )}
      {...props}
    >
      {children}
    </RadixDialog.Content>
  </DialogPortal>
));
DialogContent.displayName = RadixDialog.Content.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};

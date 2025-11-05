"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useSfx } from "../../hooks/useSfx";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { cn } from "./utils";

interface ModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Callback fired when the modal needs to close */
  onClose: () => void;
  /** Optional title rendered in header */
  title?: string;
  /** Optional description text */
  description?: string;
  /** Modal body content */
  children: React.ReactNode;
  /** Optional footer area (actions) */
  footer?: React.ReactNode;
  /** Optional display variant */
  variant?: "dialog" | "bottomsheet" | "auto";
  /** Optional element to focus on open */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Whether clicking overlay closes modal */
  closeOnOverlayClick?: boolean;
  /** Optional sound effect to play on open (maps to useSfx methods) */
  openSfx?: "add" | "complete" | "remove" | "toggle" | "focus" | null;
}

const MOBILE_BREAKPOINT = 640; // Tailwind 'sm'
const DRAG_THRESHOLD = 120; // pixels to drag before dismiss

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "auto",
  initialFocusRef,
  closeOnOverlayClick = true,
  openSfx,
}: ModalProps) {
  const sfx = useSfx();
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const isBottomSheet =
    variant === "bottomsheet" || (variant === "auto" && isMobile);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);

  // Play sound effect on open
  useEffect(() => {
    if (open && openSfx) {
      // Safely call mapped sfx method if present
      const fn = (sfx as Record<string, () => void>)[openSfx];
      fn?.();
    }
  }, [open, openSfx, sfx]);

  // Focus initial element
  useEffect(() => {
    if (open && initialFocusRef?.current) {
      initialFocusRef.current.focus();
    }
  }, [open, initialFocusRef]);

  return (
    <RadixDialog.Root open={open} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {open && (
          <RadixDialog.Portal forceMount>
            {/* Overlay */}
            <RadixDialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/65"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => closeOnOverlayClick && onClose()}
              />
            </RadixDialog.Overlay>

            {/* Content */}
            <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center pointer-events-none">
              <RadixDialog.Content asChild forceMount>
                <motion.div
                  ref={dragConstraintsRef}
                  className={cn(
                    "w-full max-w-md rounded-t-xl sm:rounded-xl p-6 pointer-events-auto",
                    "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-fg))]",
                    "shadow-(--shadow-soft)",
                    isBottomSheet ? "bottom-0 left-0 right-0" : "relative"
                  )}
                  initial={
                    isBottomSheet ? { y: "100%" } : { scale: 0.95, opacity: 0 }
                  }
                  animate={isBottomSheet ? { y: 0 } : { scale: 1, opacity: 1 }}
                  exit={
                    isBottomSheet ? { y: "100%" } : { scale: 0.95, opacity: 0 }
                  }
                  transition={{
                    duration: 0.2,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  {...(isBottomSheet && {
                    drag: "y",
                    dragConstraints: dragConstraintsRef,
                    onDragEnd: (e, info) => {
                      if (info.offset.y > DRAG_THRESHOLD) {
                        onClose();
                      }
                    },
                  })}
                >
                  {/* Header */}
                  {(title || description) && (
                    <div className="mb-4">
                      {title && (
                        <RadixDialog.Title className="text-xl font-semibold text-[rgb(var(--color-fg))]">
                          {title}
                        </RadixDialog.Title>
                      )}
                      {description && (
                        <RadixDialog.Description className="text-sm text-[rgb(var(--color-fg-muted))] mt-1">
                          {description}
                        </RadixDialog.Description>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div className="space-y-4">{children}</div>

                  {/* Footer */}
                  {footer && (
                    <div className="mt-6 flex justify-end gap-3">{footer}</div>
                  )}
                </motion.div>
              </RadixDialog.Content>
            </div>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
}

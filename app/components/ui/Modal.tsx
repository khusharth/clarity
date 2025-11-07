"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useSfx } from "../../hooks/useSfx";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { useAppReducedMotion } from "../../hooks/useAppReducedMotion";
import { cn } from "./utils";

/**
 * Unified Modal component that renders as a dialog on desktop and bottom sheet on mobile.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed?"
 * >
 *   <p>Modal content goes here</p>
 * </Modal>
 *
 * // With footer actions
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Edit Task"
 * >
 *   <Input value={text} onChange={setText} />
 *   <div className="flex gap-2 mt-4">
 *     <Button onClick={() => setIsOpen(false)}>Cancel</Button>
 *     <Button variant="accent" onClick={handleSave}>Save</Button>
 *   </div>
 * </Modal>
 *
 * // With initial focus
 * const inputRef = useRef<HTMLInputElement>(null);
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Add Task"
 *   initialFocusRef={inputRef}
 *   openSfx="add"
 * >
 *   <Input ref={inputRef} placeholder="Task name" />
 * </Modal>
 * ```
 */
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
  const isMobile = useIsMobile();
  const reducedMotion = useAppReducedMotion();
  const isBottomSheet =
    variant === "bottomsheet" || (variant === "auto" && isMobile);

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
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                onClick={() => closeOnOverlayClick && onClose()}
              />
            </RadixDialog.Overlay>

            {/* Content */}
            <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center pointer-events-none">
              <RadixDialog.Content asChild forceMount>
                <motion.div
                  className={cn(
                    "w-full max-w-md rounded-t-xl sm:rounded-xl p-6 pointer-events-auto",
                    "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-fg))]",
                    "shadow-(--shadow-soft)",
                    isBottomSheet ? "bottom-0 left-0 right-0 pb-10" : "relative"
                  )}
                  initial={
                    reducedMotion
                      ? {}
                      : isBottomSheet
                      ? { y: "100%" }
                      : { scale: 0.95, opacity: 0 }
                  }
                  animate={
                    reducedMotion
                      ? {}
                      : isBottomSheet
                      ? { y: 0 }
                      : { scale: 1, opacity: 1 }
                  }
                  exit={
                    reducedMotion
                      ? {}
                      : isBottomSheet
                      ? { y: "100%" }
                      : { scale: 0.95, opacity: 0 }
                  }
                  transition={{
                    duration: reducedMotion ? 0 : 0.2,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  {...(isBottomSheet && {
                    drag: "y",
                    dragConstraints: { top: 0, bottom: 0 },
                    dragElastic: { top: 0, bottom: 0.2 },
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

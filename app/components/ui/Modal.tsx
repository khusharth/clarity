'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useSfx } from '../hooks/useSfx';
import { useMediaQuery } from '../hooks/useMediaQuery';

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
  variant?: 'dialog' | 'bottomsheet' | 'auto';
  /** Optional element to focus on open */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Whether clicking overlay closes modal */
  closeOnOverlayClick?: boolean;
  /** Optional sound effect to play on open */
  openSfx?: 'open' | 'confirm' | 'delete' | null;
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
  variant = 'auto',
  initialFocusRef,
  closeOnOverlayClick = true,
  openSfx,
}: ModalProps) {
  const sfx = useSfx();
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const isBottomSheet = variant === 'bottomsheet' || (variant === 'auto' && isMobile);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);

  // Play sound effect on open
  useEffect(() => {
    if (open && openSfx && sfx[openSfx]) {
      sfx[openSfx]();
    }
  }, [open, openSfx, sfx]);

  // Focus initial element
  useEffect(() => {
    if (open && initialFocusRef?.current) {
      initialFocusRef.current.focus();
    }
  }, [open, initialFocusRef]);

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <Dialog.Overlay asChild>
              <motion.div 
                className="fixed inset-0 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => closeOnOverlayClick && onClose()}
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content asChild>
              <motion.div
                ref={dragConstraintsRef}
                className={`
                  fixed bg-surface text-fg-muted p-6 shadow-soft max-w-md w-full
                  ${isBottomSheet 
                    ? 'bottom-0 left-0 right-0 rounded-t-xl'
                    : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl'
                  }
                `}
                initial={isBottomSheet 
                  ? { y: '100%' }
                  : { scale: 0.95, opacity: 0 }
                }
                animate={isBottomSheet
                  ? { y: 0 }
                  : { scale: 1, opacity: 1 }
                }
                exit={isBottomSheet
                  ? { y: '100%' }
                  : { scale: 0.95, opacity: 0 }
                }
                transition={{ 
                  duration: 0.2,
                  ease: [0.32, 0.72, 0, 1]
                }}
                {...(isBottomSheet && {
                  drag: 'y',
                  dragConstraints: dragConstraintsRef,
                  onDragEnd: (e, info) => {
                    if (info.offset.y > DRAG_THRESHOLD) {
                      onClose();
                    }
                  }
                })}
              >
                {/* Header */}
                {(title || description) && (
                  <div className="mb-4">
                    {title && (
                      <Dialog.Title className="text-xl font-semibold">
                        {title}
                      </Dialog.Title>
                    )}
                    {description && (
                      <Dialog.Description className="text-sm mt-1">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>
                )}

                {/* Body */}
                <div className="space-y-4">
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div className="mt-6 flex justify-end gap-3">
                    {footer}
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
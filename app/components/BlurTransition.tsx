import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type BlurTransitionProps = {
  children: React.ReactNode;
  visible?: boolean;
  duration?: number; // seconds
  className?: string;
  childrenKey?: React.Key;
};

/**
 * A tiny, reusable blur out / fade in component using Framer Motion.
 * - Use `visible` to control mounting/unmounting fade.
 * - Use `duration` to control the crossfade time.
 * - If you want to crossfade between different children, pass a changing `childrenKey`.
 */
export default function BlurTransition({
  children,
  visible = true,
  duration = 0.6,
  className,
  childrenKey,
}: BlurTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {/* {visible ? ( */}
      <motion.div
        key={childrenKey ?? "blur"}
        initial={{ filter: "blur(20px)", opacity: 0 }}
        // animate={{ filter: "blur(0px)", opacity: 1 }}
        animate={
          visible
            ? { filter: "blur(0px)", opacity: 1 }
            : { filter: "blur(20px)", opacity: 0 }
        }
        exit={{ filter: "blur(20px)", opacity: 0 }}
        transition={{ duration, ease: "easeOut" }}
        // style={{ pointerEvents: visible ? "auto" : "none" }}
        className={className}
      >
        {children}
      </motion.div>
      {/* ) : null} */}
    </AnimatePresence>
  );
}

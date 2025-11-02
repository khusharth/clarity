import { Variants } from "framer-motion";

export const itemVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const listVariants: Variants = {
  animate: { transition: { staggerChildren: 0.04 } },
};

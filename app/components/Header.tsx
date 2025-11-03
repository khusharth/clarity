"use client";
import React from "react";
import { motion, useInView } from "framer-motion";

const AnimatedBlurHeading = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.h1
      ref={ref}
      initial={{ filter: "blur(20px)", opacity: 0 }}
      animate={isInView ? { filter: "blur(0px)", opacity: 1 } : {}}
      transition={{ duration: 1 }}
      className="text-3xl text-center"
    >
      {children}
    </motion.h1>
  );
};

const Header = () => {
  return (
    <div className="mt-6 text-center">
      <AnimatedBlurHeading>Clarity</AnimatedBlurHeading>
    </div>
  );
};

export default Header;

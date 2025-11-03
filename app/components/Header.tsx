"use client";
import React from "react";
import { useInView } from "framer-motion";
import BlurTransition from "./BlurTransition";

const AnimatedBlurHeading = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref}>
      <BlurTransition visible={isInView} duration={1}>
        {children}
      </BlurTransition>
    </div>
  );
};

const Header = () => {
  return (
    <div className="mt-6 text-center">
      <AnimatedBlurHeading>
        <h1 className="text-3xl text-center">Clarity</h1>
      </AnimatedBlurHeading>
    </div>
  );
};

export default Header;

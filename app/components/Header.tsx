"use client";
import React from "react";
import { SparklesIcon } from "lucide-react";
import { useInView } from "framer-motion";
import BlurTransition from "./BlurTransition";

const AnimatedBlurHeading = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className={className}>
      <BlurTransition visible={isInView} duration={1}>
        {children}
      </BlurTransition>
    </div>
  );
};

const Header = () => {
  return (
    <AnimatedBlurHeading className="mt-6">
      <h1 className="flex font-(family-name:--font-geist-sans) justify-center items-center text-3xl ">
        <SparklesIcon className="inline mr-1.5" /> Clarity
      </h1>
    </AnimatedBlurHeading>
  );
};

export default Header;

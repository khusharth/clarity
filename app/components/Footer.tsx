"use client";
import NextImage from "next/image";
import React from "react";
import { useTodos } from "../store/todos";
import GithubIconLight from "../../public/github-logo/github-white.svg";
import GithubIconDark from "../../public/github-logo/github-dark.svg";
import BlurTransition from "./BlurTransition";

const Footer = () => {
  const { themePreference, isFocus } = useTodos();
  const [isInitialMount, setIsInitialMount] = React.useState(true);

  React.useEffect(() => {
    setIsInitialMount(false);
  }, []);

  const isLightTheme = themePreference === "light";

  return (
    <BlurTransition visible={!isFocus} duration={isInitialMount ? 0 : 1}>
      <footer className="flex justify-center items-center pt-16 pb-24 sm:p-16 ">
        <a
          href="https://github.com/khusharth/clarity"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:underline hover:cursor-pointer text-xs"
        >
          <div className="w-5 h-5 relative mr-2">
            <NextImage
              fill
              src={isLightTheme ? GithubIconDark : GithubIconLight}
              alt=""
            />
          </div>{" "}
          <span>khusharth/clarity</span>
        </a>
      </footer>
    </BlurTransition>
  );
};

export default Footer;

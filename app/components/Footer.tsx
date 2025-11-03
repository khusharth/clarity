"use client";
import NextImage from "next/image";
import { useTodos } from "../store/todos";
import GithubIconLight from "../../public/github-logo/github-white.svg";
import GithubIconDark from "../../public/github-logo/github-dark.svg";

const Footer = () => {
  const { themePreference } = useTodos();

  const isLightTheme = themePreference === "light";

  return (
    <footer className="flex justify-center items-center p-12">
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
  );
};

export default Footer;

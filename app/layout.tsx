import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles/theme.css";
import ThemeProvider from "./components/ThemeProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clarity",
  description: "Eisenhower Matrix – minimal, delightful, local-first TODOs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] min-h-screen flex flex-col`}
      >
        <ThemeProvider />
        <Header />

        <main className="flex-1 overflow-auto bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}

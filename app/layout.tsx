import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles/theme.css";
import ThemeProvider from "./components/ThemeProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Toasts from "./components/Toasts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const OG_META = {
  TITLE: "Clarity — Clear Tasks. Calm Mind.",
  DESCRIPTION: "Quiet the clutter. Focus on what truly matters.",
  URL: "https://claritytodo.vercel.app/",
};

export const metadata: Metadata = {
  title: OG_META.TITLE,
  description: OG_META.DESCRIPTION,
  metadataBase: new URL(OG_META.URL),
  openGraph: {
    title: OG_META.TITLE,
    description: OG_META.DESCRIPTION,
    url: OG_META.URL,
    siteName: "Clarity",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Clarity App Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_META.TITLE,
    description: OG_META.DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] min-h-screen flex flex-col`}
      >
        <ThemeProvider />
        <Header />

        <main className="flex-1 overflow-auto bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]">
          {children}
        </main>

        <Footer />
        <Toasts />
      </body>
    </html>
  );
}

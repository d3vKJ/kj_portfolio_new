import type { Metadata } from "next";
import "./globals.css";
import CursorGlow from "@/components/CursorGlow";
import MagneticCursor from "@/components/MagneticCursor";

export const metadata: Metadata = {
  title: "KJ Portfolio",
  description: "장경진 — Frontend Developer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="noise min-h-full bg-[#0a0a0a] text-white">
        <CursorGlow />
        <MagneticCursor />
        {children}
      </body>
    </html>
  );
}

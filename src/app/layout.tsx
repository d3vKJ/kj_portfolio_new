import type { Metadata } from "next";
import "./globals.css";
import CursorGlow from "@/components/CursorGlow";
import MagneticCursor from "@/components/MagneticCursor";

export const metadata: Metadata = {
  title: "장경진 포트폴리오",
  description: "장경진 포트폴리오",
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
      <body className="relative min-h-full text-white">
        <div className="ambient" aria-hidden />
        <div className="relative z-[2]">
          <CursorGlow />
          <MagneticCursor />
          {children}
        </div>
      </body>
    </html>
  );
}

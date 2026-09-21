import type { Metadata } from "next";
import "./globals.css";

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
      <body className="noise min-h-full bg-black text-white">{children}</body>
    </html>
  );
}

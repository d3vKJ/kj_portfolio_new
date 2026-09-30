import type { Metadata } from "next";
import "./globals.css";
import CursorGlow from "@/components/CursorGlow";

export const metadata: Metadata = {
  title: "장경진 포트폴리오",
  description: "장경진 포트폴리오",
};

const themeBootScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}var el=document.documentElement;el.dataset.theme=t;el.style.colorScheme=t}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="relative min-h-full text-ink">
        <div className="ambient" aria-hidden />
        <div className="relative z-[2]">
          <CursorGlow />
          {children}
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import CursorGlow from "@/components/CursorGlow";

const title = "장경진 포트폴리오";
const description = "웹과 데스크톱 앱을 만드는 장경진의 포트폴리오입니다.";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return {
    metadataBase: new URL(`${proto}://${host}`),
    title,
    description,
    openGraph: {
      title,
      description,
      locale: "ko_KR",
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "192x192", type: "image/png" }],
    },
    manifest: "/manifest.json",
    other: {
      "msapplication-config": "/browserconfig.xml",
    },
  };
}

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

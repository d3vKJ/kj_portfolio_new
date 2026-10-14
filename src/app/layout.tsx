import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import CursorGlow from "@/components/CursorGlow";
import { HERO_VIDEO, HERO_VIDEO_CACHE_FLAG } from "@/data/heroVideo";
import { siteUrl } from "@/data/site";

const title = "장경진 | 프론트엔드 개발자 포트폴리오";
const description = "장경진 | 프론트엔드 개발자 포트폴리오";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return {
    metadataBase: new URL(`${proto}://${host}`),
    title,
    description,
    alternates: { canonical: siteUrl },
    robots: { index: true, follow: true },
    verification: {
      other: { "naver-site-verification": "f6c114c52d499102a153c073beac088eb6ec1fad" },
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      locale: "ko_KR",
      type: "website",
      images: [{ url: `${siteUrl}/og.png?v=2`, width: 1200, height: 630, alt: title, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og.png?v=2`],
    },
    icons: {
      icon: [
        { url: "/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon.ico", sizes: "96x96", type: "image/x-icon" },
      ],
      apple: [{ url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.json",
    other: {
      "msapplication-config": "/browserconfig.xml",
    },
  };
}

const themeBootScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t="dark";var el=document.documentElement;el.dataset.theme=t;el.style.colorScheme=t}catch(e){}})();`;
const heroCacheBootScript = `(function(){try{if(localStorage.getItem(${JSON.stringify(HERO_VIDEO_CACHE_FLAG)})===${JSON.stringify(HERO_VIDEO)})document.documentElement.dataset.heroCached="1"}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="dark" className="h-full antialiased" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <script dangerouslySetInnerHTML={{ __html: heroCacheBootScript }} />
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

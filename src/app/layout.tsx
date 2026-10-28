import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { siteUrl } from "@/data/site";
import { THEME_SCRIPT } from "@/lib/theme";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* 첫 화면이 밝게 번쩍이지 않게 그리기 전에 테마를 정해요 */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
        {/* 여권 서명 손글씨: 좌우명에 쓰는 글자만 받아요 */}
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap&text=${encodeURIComponent("도전은무료니까,만큼사치부리자")}`} />
      </head>
      <body className="min-h-full">
        {/* 도장 잉크 번짐 */}
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" /><feDisplacementMap in="SourceGraphic" scale="2.4" /></filter>
        </svg>
        {children}
      </body>
    </html>
  );
}

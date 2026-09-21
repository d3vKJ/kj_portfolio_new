"use client";

import { useState, useEffect } from "react";
import type { Category } from "./Sidebar";

const ICON_SLUG: Record<string, { slug: string; light?: boolean }> = {
  "React":        { slug: "react" },
  "Next.js":      { slug: "nextdotjs", light: true },
  "TypeScript":   { slug: "typescript" },
  "Tailwind CSS": { slug: "tailwindcss" },
  "Vite":         { slug: "vite" },
  "Sass":         { slug: "sass" },
  "React Router": { slug: "reactrouter" },
  "Prisma":       { slug: "prisma", light: true },
  "Stripe":       { slug: "stripe" },
  "Three.js":     { slug: "threedotjs", light: true },
  "GSAP":         { slug: "greensock" },
  "Storybook":    { slug: "storybook" },
  "Radix UI":     { slug: "radixui", light: true },
  "CSS Modules":  { slug: "css3" },
  "Swiper":         { slug: "swiper" },
  "Framer Motion":  { slug: "framer" },
  "Cloudflare":     { slug: "cloudflare" },
  "Supabase":       { slug: "supabase" },
};

/** code: URL | null(비공개) | "#"(링크 미등록) */
const PROJECTS = [
  { name: "daimon",         nameKo: "다이몬",          year: "2026", solo: true, desc: "외주 작업 자동차 카본 파츠 업체 프론트, 백 및 토스 결제까지 모두 구현", tech: ["Next.js","TypeScript","Tailwind CSS","Framer Motion","Supabase","Cloudflare","Swiper"], status: "shipped", category: "Web" as Category, href: "https://daimon-web.nova021206.workers.dev/", code: null },
  { name: "apple",          nameKo: "애플",             year: "2026", solo: true, desc: "Apple 제품 소개 클론. 스크롤 인터랙션과 반응형 레이아웃.", tech: ["React","TypeScript","Vite","Sass","React Router"], status: "shipped", category: "Web" as Category, href: "http://103.218.172.76:1004", code: "#" },
  { name: "genesis",        nameKo: "제네시스",         year: "2026", solo: true, desc: "GSAP 애니메이션, Swiper 슬라이더, shadcn/ui 컴포넌트.", tech: ["Next.js","TypeScript","Tailwind CSS","GSAP","Swiper"], status: "shipped", category: "Web" as Category, href: "http://103.218.172.76:6102", code: "#" },
  { name: "airport-typing", nameKo: "에어포트 타이핑", year: "2026", solo: true, desc: "세계 주요 국제공항을 타이핑하며 익히는 인터랙티브 학습 게임.", tech: ["React","Vite","GSAP","Sass"], status: "shipped", category: "Web" as Category, href: "http://103.218.172.76:3000", code: "#" },
];

export default function Projects() {
  const [filterCat, setFilterCat] = useState<Category>("All");
  const [selIdx, setSelIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fn = (e: Event) => { setFilterCat((e as CustomEvent).detail.category); setSelIdx(0); setLoaded(false); };
    window.addEventListener("filter-category", fn);
    return () => window.removeEventListener("filter-category", fn);
  }, []);

  const list = filterCat === "All" ? PROJECTS : PROJECTS.filter(p => p.category === filterCat);
  const activeIdx = list.length === 0 ? 0 : Math.min(selIdx, list.length - 1);
  const p = list[activeIdx];

  const select = (i: number) => { setSelIdx(i); setLoaded(false); };

  return (
    <section className="h-full overflow-y-auto pl-4 sm:pl-36 lg:pl-40">
      {/*
        균형 그리드 — 인덱스 좁게 + 메타·프리뷰 5:7
        - base 4col: 인덱스 → 프리뷰 → 메타
        - md 8col: 인덱스 2 | 메타 3 | 프리뷰 3
        - lg 12col: 인덱스 2 | 메타 5 | 프리뷰 5
      */}
      <div className="grid h-full min-h-full grid-cols-4 items-stretch gap-0 md:grid-cols-8 lg:grid-cols-12">

        {/* ── 인덱스 ── */}
        <aside className="col-span-4 flex flex-col border-b border-white/[0.08] px-5 py-8 sm:px-6 md:col-span-8 md:border-b lg:col-span-2 lg:border-b-0 lg:border-r lg:py-12 lg:pl-6 lg:pr-5">
          <div className="mb-6 shrink-0 lg:mb-8">
            <h2 className="text-3xl font-semibold tracking-tight">Projects</h2>
            <p className="mt-2 text-sm text-white/40">{list.length} works</p>
          </div>

          {list.length === 0 ? (
            <p className="text-base text-white/35">해당 카테고리 프로젝트 없음</p>
          ) : (
            <nav
              className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible"
              aria-label="프로젝트 목록"
            >
              {list.map((item, i) => {
                const active = i === activeIdx;
                return (
                  <button
                    key={item.name}
                    onClick={() => select(i)}
                    className="relative flex min-h-11 shrink-0 items-center gap-3 px-2 py-2.5 text-left transition-colors duration-200 lg:w-full"
                  >
                    {active && (
                      <span
                        className="absolute inset-x-2 bottom-0 h-px bg-white/70 lg:inset-y-2 lg:left-0 lg:right-auto lg:w-0.5 lg:h-auto"
                        aria-hidden
                      />
                    )}
                    <span className={`shrink-0 font-mono text-sm tabular-nums ${active ? "text-white/50" : "text-white/25"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`whitespace-nowrap text-base transition-colors lg:truncate ${
                        active ? "font-medium text-white" : "text-white/45 hover:text-white/70"
                      }`}
                    >
                      {item.nameKo}
                    </span>
                  </button>
                );
              })}
            </nav>
          )}
        </aside>

        {list.length === 0 ? (
          <div className="col-span-4 flex items-center justify-center px-6 py-16 md:col-span-8 lg:col-span-10">
            <p className="text-base text-white/30">해당 카테고리에 표시할 프로젝트가 없습니다.</p>
          </div>
        ) : p && (
          <>
            {/* ── 메타 (프리뷰와 동일 비중) ── */}
            <div className="col-span-4 order-3 flex flex-col justify-center border-t border-white/[0.08] px-6 py-8 sm:px-8 md:col-span-3 md:order-2 md:border-t-0 md:border-r lg:col-span-5 lg:px-10 lg:py-12 xl:px-12">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-3xl font-semibold tracking-tight text-white">
                  {p.nameKo}
                </h3>
                <span className="text-lg text-white/35">{p.name}</span>
              </div>
              <p className="mt-2 text-sm text-white/35">
                {p.year}{p.solo ? " · 1인 작업" : ""}
              </p>
              <p className="mt-5 text-base leading-relaxed text-white/55 lg:max-w-md">
                {p.desc}
              </p>

              <div className="mt-8 h-px w-full max-w-md bg-white/[0.08]" />

              <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2.5">
                {p.tech.map(t => {
                  const info = ICON_SLUG[t];
                  const src = info ? `https://cdn.simpleicons.org/${info.slug}${info.light ? "/777" : ""}` : null;
                  return (
                    <li key={t} className="inline-flex items-center gap-2 text-sm text-white/50">
                      {src && (
                        <img src={src} width={16} height={16} alt="" className="shrink-0 opacity-70" />
                      )}
                      {t}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {p.href !== "#" && (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 border border-white/[0.14] px-4 py-2.5 text-sm text-white/70 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    사이트
                  </a>
                )}
                {p.code === null ? (
                  <p className="text-sm leading-snug text-white/35">
                    외주 작업 및 기업에서 운영되는 사이트로 인하여 코드를 공개할 수 없습니다.
                  </p>
                ) : (
                  <a
                    href={p.code}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 border border-white/[0.14] px-4 py-2.5 text-sm text-white/70 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.529 2.341 1.087 2.912.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    코드
                  </a>
                )}
              </div>
            </div>

            {/* ── 프리뷰: 셀을 꽉 채움 (떠 있는 박스/여백 제거) ── */}
            <div className="col-span-4 order-2 flex min-h-[280px] flex-col border-t border-white/[0.08] p-5 sm:p-6 md:col-span-3 md:order-3 md:min-h-0 md:border-t-0 lg:col-span-5 lg:p-8">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-white/[0.1] bg-[#0a0a0a]">
                <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/[0.08] px-4">
                  <span className="h-2 w-2 rounded-full bg-white/[0.12]" />
                  <span className="h-2 w-2 rounded-full bg-white/[0.12]" />
                  <span className="h-2 w-2 rounded-full bg-white/[0.12]" />
                  <span className="mx-2 flex h-5 min-w-0 flex-1 items-center">
                    <span className="truncate font-mono text-xs text-white/30 sm:text-sm">
                      {p.href !== "#" ? p.href : "— 미리보기 없음 —"}
                    </span>
                  </span>
                </div>

                {p.href !== "#" ? (
                  <div className="relative min-h-0 flex-1 overflow-hidden">
                    {!loaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                      </div>
                    )}
                    <iframe
                      key={p.href}
                      src={p.href}
                      title={`${p.nameKo} 미리보기`}
                      className="h-full w-full border-none"
                      onLoad={() => setLoaded(true)}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-base text-white/30">배포 준비 중</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

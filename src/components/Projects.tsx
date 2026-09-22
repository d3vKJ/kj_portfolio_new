"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

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

type Category = "Web" | "Desktop" | "Android" | "All";
const CATEGORIES: Category[] = ["All", "Web", "Desktop", "Android"];

const PROJECTS = [
  { name: "daimon",         nameKo: "다이몬",          year: "2026", solo: true, desc: "외주 작업 자동차 카본 파츠 업체 프론트, 백 및 토스 결제까지 모두 구현", tech: ["Next.js","TypeScript","Tailwind CSS","Framer Motion","Supabase","Cloudflare","Swiper"], category: "Web" as Category, href: "https://daimon-web.nova021206.workers.dev/", code: null, image: "/projects/daimon.png" },
  { name: "apple",          nameKo: "애플",             year: "2026", solo: true, desc: "Apple 제품 소개 클론. 스크롤 인터랙션과 반응형 레이아웃.", tech: ["React","TypeScript","Vite","Sass","React Router"], category: "Web" as Category, href: "http://103.218.172.76:1004", code: "#", image: "/projects/apple.png" },
  { name: "genesis",        nameKo: "제네시스",         year: "2026", solo: true, desc: "GSAP 애니메이션, Swiper 슬라이더, shadcn/ui 컴포넌트.", tech: ["Next.js","TypeScript","Tailwind CSS","GSAP","Swiper"], category: "Web" as Category, href: "http://103.218.172.76:6102", code: "#", image: "/projects/genesis.png" },
  { name: "airport-typing", nameKo: "에어포트 타이핑", year: "2026", solo: true, desc: "세계 주요 국제공항을 타이핑하며 익히는 인터랙티브 학습 게임.", tech: ["React","Vite","GSAP","Sass"], category: "Web" as Category, href: "http://103.218.172.76:3000", code: "#", image: "/projects/airport-typing.png" },
  { name: "coming-soon-1",  nameKo: "다음 프로젝트",    year: "—",    solo: true, desc: "준비 중인 웹 프로젝트입니다.", tech: [], category: "Web" as Category, href: "#", code: "#", image: null },
  { name: "coming-soon-2",  nameKo: "다음 프로젝트",    year: "—",    solo: true, desc: "준비 중인 데스크톱 프로젝트입니다.", tech: [], category: "Desktop" as Category, href: "#", code: "#", image: null },
  { name: "coming-soon-3",  nameKo: "다음 프로젝트",    year: "—",    solo: true, desc: "준비 중인 안드로이드 프로젝트입니다.", tech: [], category: "Android" as Category, href: "#", code: "#", image: null },
];

function TechIcon({ name }: { name: string }) {
  const info = ICON_SLUG[name];
  if (!info) return null;
  const src = `https://cdn.simpleicons.org/${info.slug}${info.light ? "/777" : ""}`;
  return <Image src={src} width={16} height={16} alt="" unoptimized className="shrink-0 opacity-70" />;
}

function CardThumb({ item }: { item: (typeof PROJECTS)[number] }) {
  return (
    <motion.div
      layoutId={`card-${item.name}`}
      transition={{ layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
      style={{ pointerEvents: "none" }}
      className={`relative aspect-[16/10] w-full overflow-hidden bg-white/[0.03] ${
        item.image ? "" : "border-b border-dashed border-white/10"
      }`}
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={`${item.nameKo} 대표 스크린샷`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/20">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-[9px] uppercase tracking-[0.2em]">Coming Soon</span>
        </div>
      )}
    </motion.div>
  );
}

export default function Projects() {
  const [filterCat, setFilterCat] = useState<Category>("All");
  const [selected, setSelected] = useState<number | null>(null);

  // 모달 열려있을 때 Esc로 닫기
  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const list = filterCat === "All" ? PROJECTS : PROJECTS.filter(p => p.category === filterCat);
  const p = selected !== null ? list[selected] : null;

  return (
    <section className="pl-[var(--content-pl)] pr-[var(--content-pr)] pt-[var(--header-space)] pb-24 sm:pb-12">
      <div className="mx-auto w-full max-w-[var(--content-max)]">
        <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="section-title">Projects</h2>
          <p className="text-sm text-white/40 sm:text-base">모든 프로젝트는 1인 작업물이에요.</p>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-8 flex gap-2 overflow-x-auto py-1">
          {CATEGORIES.map((cat) => {
            const isActive = filterCat === cat;
            return (
              <button
                key={cat}
                onClick={() => { setFilterCat(cat); setSelected(null); }}
                className="glass-ios shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive ? "var(--accent)" : "rgba(255,255,255,0.45)",
                  background: isActive ? "color-mix(in srgb, var(--accent) 14%, transparent)" : undefined,
                  borderColor: isActive ? "color-mix(in srgb, var(--accent) 50%, transparent)" : undefined,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

          {/* 카드 갤러리 */}
        {list.length === 0 ? (
          <p className="py-16 text-center text-white/30">해당 카테고리에 표시할 프로젝트가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {list.map((item, i) => (
              <button
                key={item.name}
                onClick={() => setSelected(i)}
                className="group glass-ios flex flex-col overflow-hidden rounded-2xl text-left transition-colors duration-200 hover:border-[var(--accent)]/40"
                style={{ animation: `cardIn 400ms ease-out ${i * 60}ms both` }}
              >
                <CardThumb item={item} />
                <div className="flex flex-1 flex-col gap-2 border-t border-white/[0.06] px-4 py-4 sm:px-5 sm:py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold tracking-tight text-white/90 transition-colors group-hover:text-white sm:text-lg">
                        {item.nameKo}
                      </h3>
                      <p className="mt-0.5 truncate text-[12px] tracking-wide text-white/35">{item.name}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-white/30">{item.year}</span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-white/45">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {p && (
          <motion.div
            key="modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="glass-modal max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                layoutId={`card-${p.name}`}
                transition={{ layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                className="relative aspect-[16/10] w-full"
              >
                {p.image ? (
                  <Image src={p.image} alt={`${p.nameKo} 대표 스크린샷`} fill sizes="672px" className="object-cover object-top" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white/[0.02] text-white/20">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-[0.2em]">Coming Soon</span>
                  </div>
                )}
                <button
                  onClick={() => setSelected(null)}
                  aria-label="닫기"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white/85 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.2)] backdrop-blur-md transition-colors hover:border-white/35 hover:bg-black/45 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-2xl font-semibold tracking-tight text-white">{p.nameKo}</h3>
                <span className="text-base text-white/35">{p.name}</span>
              </div>
              <p className="mt-1 text-sm text-white/35">{p.year}{p.solo ? " · 1인 작업" : ""}</p>
              <p className="mt-4 text-base leading-relaxed text-white/55">{p.desc}</p>

              <div className="mt-6 h-px w-full bg-white/[0.08]" />

              {p.tech.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2.5">
                  {p.tech.map(t => (
                    <li key={t} className="inline-flex items-center gap-2 text-sm text-white/50">
                      <TechIcon name={t} />
                      {t}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {p.href !== "#" && (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-ios inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white/75 transition-all duration-200 hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
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
                ) : p.code !== "#" ? (
                  <a
                    href={p.code}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-ios inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white/75 transition-all duration-200 hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.529 2.341 1.087 2.912.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    코드
                  </a>
                ) : null}
              </div>
            </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}

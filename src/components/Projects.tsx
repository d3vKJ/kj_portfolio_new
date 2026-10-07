"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { PROJECTS, type Project, type Category } from "@/data/projects";
import ProposalModal from "@/components/ProposalModal";

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

const CATEGORIES: Category[] = ["All", "Web", "Desktop", "Android"];

function TechIcon({ name }: { name: string }) {
  const info = ICON_SLUG[name];
  if (!info) return null;
  const src = `https://cdn.simpleicons.org/${info.slug}${info.light ? "/777" : ""}`;
  return <Image src={src} width={16} height={16} alt="" unoptimized className="shrink-0 opacity-70" />;
}

function CardThumb({ item }: { item: Project }) {
  return (
    // layoutId로 카드 썸네일 → 모달 썸네일 공유 요소 전환 (Framer Motion shared layout)
    <motion.div
      layoutId={`card-${item.name}`}
      transition={{ layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
      style={{ pointerEvents: "none" }}
      className={`relative aspect-[16/10] w-full overflow-hidden bg-ink/[0.03] ${
        item.image ? "" : "border-b border-dashed border-ink/10"
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
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink/20">
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
  const [proposalOpen, setProposalOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const proposalBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  // 모달 열려있을 때 닫기 버튼으로 포커스, 닫을 때 카드로 복귀
  useEffect(() => {
    if (selected === null) return;
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(id);
      lastFocusRef.current?.focus?.();
    };
  }, [selected]);

  // Esc: 기획안이 열려 있으면 기획안만 닫고, 아니면 프로젝트 모달을 닫는다
  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (proposalOpen) setProposalOpen(false);
      else setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, proposalOpen]);

  useEffect(() => {
    setProposalOpen(false);
  }, [selected]);

  const list = filterCat === "All" ? PROJECTS : PROJECTS.filter(p => p.category === filterCat);
  const p = selected !== null ? list[selected] : null;

  return (
    <section className="pl-[var(--content-pl)] pr-[var(--content-pr)] pt-[var(--header-space)] pb-24 sm:pb-12">
      <div className="mx-auto w-full max-w-[var(--content-max)]">
        <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="section-title">Projects</h2>
          <p className="section-desc text-sm sm:text-base">모든 프로젝트는 1인 작업물이에요.</p>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-8 flex gap-2 overflow-x-auto py-1" role="group" aria-label="프로젝트 카테고리">
          {CATEGORIES.map((cat) => {
            const isActive = filterCat === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => { setFilterCat(cat); setSelected(null); }}
                aria-pressed={isActive}
                className="glass-ios shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.06] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                style={{
                  color: isActive ? "var(--accent)" : "color-mix(in srgb, var(--fg) 45%, transparent)",
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
          <p className="py-16 text-center text-ink/30">해당 카테고리에 표시할 프로젝트가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {list.map((item, i) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`${item.nameKo} 상세 보기`}
                className="group glass-ios flex flex-col overflow-hidden rounded-2xl text-left transition-[border-color,box-shadow] duration-300 hover:border-[var(--accent)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                style={{ animation: `cardIn 400ms ease-out ${i * 60}ms both` }}
              >
                <div className="flex w-full flex-col opacity-70 transition-opacity duration-300 group-hover:opacity-100">
                <CardThumb item={item} />
                <div className="flex flex-1 flex-col gap-2 border-t border-ink/[0.06] px-4 py-4 sm:px-5 sm:py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold tracking-tight text-ink/90 transition-colors group-hover:text-ink sm:text-lg">
                        {item.nameKo}
                      </h3>
                      <p className="mt-0.5 truncate text-[12px] tracking-wide text-ink/35">{item.name}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-ink/30">{item.year}</span>
                  </div>
                  <p className="section-desc line-clamp-2 text-sm leading-relaxed">{item.desc}</p>
                </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* portal: SectionSlider의 transform 컨텍스트 바깥(document.body)에 렌더링해야 fixed가 정확히 작동 */}
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
            role="presentation"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`project-title-${p.name}`}
              className="glass-modal max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl outline-none"
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
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink/[0.02] text-ink/20">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-[0.2em]">Coming Soon</span>
                  </div>
                )}
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="닫기"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white/85 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.2)] backdrop-blur-md transition-colors hover:border-white/35 hover:bg-black/45 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 id={`project-title-${p.name}`} className="text-2xl font-semibold tracking-tight text-ink">{p.nameKo}</h3>
                <span className="text-base text-ink/35">{p.name}</span>
              </div>
              <p className="mt-1 text-sm text-ink/35">{p.year}{p.solo ? " · 1인 작업" : ""}</p>
              <p className="section-desc mt-4 text-base leading-relaxed">{p.desc}</p>

              <div className="mt-6 h-px w-full bg-ink/[0.08]" />

              {p.tech.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2.5">
                  {p.tech.map(t => (
                    <li key={t} className="inline-flex items-center gap-2 text-sm text-ink/50">
                      <TechIcon name={t} />
                      {t}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {p.proposal && (
                  <button
                    ref={proposalBtnRef}
                    type="button"
                    onClick={() => setProposalOpen(true)}
                    className="glass-ios inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-ink/75 transition-all duration-200 hover:border-[var(--accent)]/40 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    기획안
                  </button>
                )}
                {p.href !== "#" && (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-ios inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-ink/75 transition-all duration-200 hover:border-[var(--accent)]/40 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    사이트
                  </a>
                )}
                {p.code === null ? (
                  <p className="text-sm leading-snug text-ink/35">
                    외주 작업 및 기업에서 운영되는 사이트로 인하여 코드를 공개할 수 없습니다.
                  </p>
                ) : p.code !== "#" ? (
                  <a
                    href={p.code}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-ios inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-ink/75 transition-all duration-200 hover:border-[var(--accent)]/40 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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

      {p?.proposal && (
        <ProposalModal
          open={proposalOpen}
          src={p.proposal}
          onClose={() => setProposalOpen(false)}
          returnFocusRef={proposalBtnRef}
        />
      )}
    </section>
  );
}

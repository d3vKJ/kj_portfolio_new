"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type IconInfo = { slug?: string; color: string; light?: boolean; svg?: string };

const ICONS: Record<string, IconInfo> = {
  "React":         { slug: "react",        color: "#61DAFB" },
  "Next.js":       { slug: "nextdotjs",    color: "#ffffff", light: true },
  "TypeScript":    { slug: "typescript",   color: "#3178C6" },
  "Tailwind CSS":  { slug: "tailwindcss",  color: "#06B6D4" },
  "Framer Motion": { slug: "framer",       color: "#0055FF" },
  "GSAP":          { slug: "greensock",    color: "#88CE02" },
  "Sass":          { slug: "sass",         color: "#CC6699" },
  "Swiper":        { slug: "swiper",       color: "#6330F4" },
  "Figma":         { slug: "figma",        color: "#F24E1E" },
  "Photoshop":     { color: "#31A8FF", svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#001E36"/><text x="12" y="16.5" text-anchor="middle" font-family="Arial" font-weight="700" font-size="11" fill="#31A8FF">Ps</text></svg>` },
  "Git":           { slug: "git",          color: "#F05032" },
  "Vite":          { slug: "vite",         color: "#646CFF" },
  "ESLint":        { slug: "eslint",       color: "#4B32C3" },
  "Node.js":       { slug: "nodedotjs",    color: "#339933" },
  "Supabase":      { slug: "supabase",     color: "#3FCF8E" },
  "Cloudflare":    { slug: "cloudflare",   color: "#F38020" },
  "Vercel":        { slug: "vercel",       color: "#ffffff", light: true },
  "Claude":        { slug: "claude",       color: "#D97757" },
  "Codex":         { color: "#ffffff", svg: `<svg viewBox="0 0 24 24" fill="#ffffff"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z"/></svg>` },
};

const GROUPS = [
  { label: "Frontend",      skills: ["React","Next.js","TypeScript","Tailwind CSS","Framer Motion","GSAP","Sass","Swiper"] },
  { label: "Design",        skills: ["Figma","Photoshop"] },
  { label: "Tools & DX",    skills: ["Git","Vite","ESLint"] },
  { label: "Backend/Infra", skills: ["Node.js","Supabase","Cloudflare","Vercel"] },
  { label: "AI",            skills: ["Claude","Codex"] },
];

function Icon({ name }: { name: string }) {
  const info = ICONS[name];
  if (!info) return null;
  if (info.svg) return (
    <span dangerouslySetInnerHTML={{ __html: info.svg.replace("<svg ", `<svg width="40" height="40" `) }} />
  );
  return <Image src={`https://cdn.simpleicons.org/${info.slug}/${info.color.replace("#", "")}`} width={40} height={40} alt={name} unoptimized className="object-contain" />;
}

const PROXIMITY_RADIUS = 140;

export default function Skills() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const underlineRef = useRef<HTMLSpanElement>(null);

  // 탭 활성 언더라인 위치 갱신 + 모바일에서 잘리지 않게 가로 스크롤만 이동
  // (scrollIntoView는 window까지 스크롤을 전파시켜 SectionSlider의 스크롤 하이재킹과 충돌하므로 사용하지 않는다)
  useEffect(() => {
    const tab = tabRefs.current[active];
    const underline = underlineRef.current;
    const scroller = tabScrollRef.current;
    if (!tab || !underline) return;
    underline.style.transform = `translateX(${tab.offsetLeft}px)`;
    underline.style.width = `${tab.offsetWidth}px`;

    if (scroller) {
      const tabLeft = tab.offsetLeft;
      const tabRight = tabLeft + tab.offsetWidth;
      if (tabLeft < scroller.scrollLeft) {
        scroller.scrollTo({ left: tabLeft - 16, behavior: "smooth" });
      } else if (tabRight > scroller.scrollLeft + scroller.clientWidth) {
        scroller.scrollTo({ left: tabRight - scroller.clientWidth + 16, behavior: "smooth" });
      }
    }
  }, [active]);

  // 커서에서 가까운 아이콘일수록 살짝 확대/부상 — 반경 140px 이내만 반응
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const cards = root.querySelectorAll<HTMLDivElement>("[data-skill-card]");
        cards.forEach((card) => {
          const r = card.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
          const f = Math.max(0, 1 - dist / PROXIMITY_RADIUS);
          card.style.transform = `translateY(${-6 * f}px) scale(${1 + 0.06 * f})`;
        });
      });
    };
    const onLeave = () => {
      root.querySelectorAll<HTMLDivElement>("[data-skill-card]").forEach((card) => {
        card.style.transform = "translateY(0) scale(1)";
      });
    };

    root.addEventListener("mousemove", onMove);
    root.addEventListener("mouseleave", onLeave);
    return () => {
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active]);

  const group = GROUPS[active];

  return (
    <section className="pl-[var(--content-pl)] pr-[var(--content-pr)] pt-12 pb-24 sm:pb-12">
      <div className="mb-8 max-w-[var(--content-max)]">
        <h2 className="section-title">Skills</h2>
        <p className="mt-1.5 text-xs text-white/35">사용 가능한 기술 스택</p>
      </div>

      {/* 카테고리 탭 */}
      <div ref={tabScrollRef} className="relative mb-10 max-w-[var(--content-max)] overflow-x-auto border-b border-white/[0.08]">
        <div className="flex gap-1">
          {GROUPS.map((g, i) => (
            <button
              key={g.label}
              ref={(el) => { tabRefs.current[i] = el; }}
              onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
              className="shrink-0 whitespace-nowrap px-4 py-3 text-sm transition-colors duration-200"
              style={{ color: active === i ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)" }}
            >
              {g.label}
              <span className="ml-2 text-xs text-white/25">{g.skills.length}</span>
            </button>
          ))}
        </div>
        <span
          ref={underlineRef}
          className="absolute bottom-0 left-0 h-[2px] transition-all duration-300"
          style={{ background: "var(--accent)", transitionTimingFunction: "cubic-bezier(0.34, 1.2, 0.64, 1)" }}
        />
      </div>

      {/* 활성 카테고리 카드 그리드 — 탭 전환 시 방향에 따라 살짝 회전하며 슬라이드(단순 페이드 대신) */}
      <div className="max-w-[var(--content-max)]" style={{ perspective: 1200 }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={group.label}
            ref={gridRef}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60, rotateY: dir * -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: dir * -60, rotateY: dir * 10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
              {group.skills.map((name, i) => {
                const info = ICONS[name];
                return (
                  <div
                    key={name}
                    data-skill-card
                    className="group relative flex flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-7 hover:bg-white/[0.06]"
                    style={{
                      "--icon-color": info?.color ?? "var(--accent)",
                      transition: "transform 150ms ease-out, background-color 200ms, border-color 200ms, box-shadow 250ms",
                      animation: `cardIn 350ms ease-out ${i * 40}ms both`,
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "color-mix(in srgb, var(--icon-color) 45%, transparent)";
                      e.currentTarget.style.boxShadow = "0 0 32px -8px var(--icon-color)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "";
                      e.currentTarget.style.boxShadow = "";
                    }}
                  >
                    <div className="opacity-85 transition-opacity group-hover:opacity-100">
                      <Icon name={name} />
                    </div>
                    <span className="text-center text-xs leading-tight text-white/50 transition-colors group-hover:text-white/80">{name}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

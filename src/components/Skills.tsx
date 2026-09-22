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

  useEffect(() => {
    const tab = tabRefs.current[active];
    const scroller = tabScrollRef.current;
    if (!tab || !scroller) return;

    if (active === 0) {
      scroller.scrollTo({ left: 0, behavior: "auto" });
      return;
    }

    // 잘린 부분만 최소로 보정 — 왼쪽에 반쯤 묻히지 않게
    const pad = 12;
    const sRect = scroller.getBoundingClientRect();
    const tRect = tab.getBoundingClientRect();
    if (tRect.left < sRect.left + pad) {
      scroller.scrollBy({ left: tRect.left - sRect.left - pad, behavior: "smooth" });
    } else if (tRect.right > sRect.right - pad) {
      scroller.scrollBy({ left: tRect.right - sRect.right + pad, behavior: "smooth" });
    }
  }, [active]);

  // Skills 섹션 진입 시 Frontend부터 보이도록 리셋
  useEffect(() => {
    const onSection = (e: Event) => {
      const { index, inSlider } = (e as CustomEvent).detail as {
        index: number;
        inSlider: boolean;
      };
      if (!inSlider || index !== 2) return;
      setActive(0);
      setDir(1);
      requestAnimationFrame(() => {
        tabScrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
      });
    };
    window.addEventListener("section-change", onSection);
    return () => window.removeEventListener("section-change", onSection);
  }, []);

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
    <section className="pl-[var(--content-pl)] pr-[var(--content-pr)] pt-[var(--header-space)] pb-24 sm:pb-12">
      <div className="mx-auto mb-8 flex max-w-[var(--content-max)] flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="section-title">Skills</h2>
        <p className="text-sm text-white/40 sm:text-base">사용 가능한 기술 스택들이에요.</p>
      </div>

      <div
        ref={tabScrollRef}
        className="mx-auto mb-10 flex max-w-[var(--content-max)] justify-start gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "none" }}
      >
        {GROUPS.map((g, i) => {
          const isActive = active === i;
          return (
            <button
              key={g.label}
              ref={(el) => { tabRefs.current[i] = el; }}
              onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
              className="glass-panel shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 sm:text-[15px]"
              style={{
                color: isActive ? "var(--accent)" : "rgba(255,255,255,0.45)",
                background: isActive ? "color-mix(in srgb, var(--accent) 12%, transparent)" : undefined,
                borderColor: isActive ? "color-mix(in srgb, var(--accent) 40%, transparent)" : undefined,
              }}
            >
              {g.label}
              <span className="ml-2 text-xs opacity-60">{g.skills.length}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto max-w-[var(--content-max)]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={group.label}
            ref={gridRef}
            custom={dir}
            initial={{ opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
              {group.skills.map((name, i) => {
                const info = ICONS[name];
                return (
                  <div
                    key={name}
                    data-skill-card
                    className="glass-panel group relative flex flex-col items-center gap-3 rounded-2xl px-4 py-7"
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

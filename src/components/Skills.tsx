"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Wave from "react-wavify";
import { PROJECTS } from "@/data/projects";

type SkillDetail = { nameKo: string; year: string; image: string | null; usage: string };

// 스킬 → 프로젝트 상세 역방향 맵
const SKILL_DETAILS = new Map<string, SkillDetail[]>();
for (const p of PROJECTS) {
  for (const tu of p.techUsage) {
    if (!SKILL_DETAILS.has(tu.skill)) SKILL_DETAILS.set(tu.skill, []);
    SKILL_DETAILS.get(tu.skill)!.push({ nameKo: p.nameKo, year: p.year, image: p.image, usage: tu.usage });
  }
}

type IconInfo = { slug?: string; color: string; light?: boolean; svg?: string };

const ICONS: Record<string, IconInfo> = {
  "HTML":          { slug: "html5",        color: "#E34F26" },
  "CSS":           { slug: "css",          color: "#1572B6" },
  "JavaScript":    { slug: "javascript",   color: "#F7DF1E" },
  "jQuery":        { slug: "jquery",       color: "#0769AD" },
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
  "Electron":      { slug: "electron",     color: "#47848F" },
  "React Native":  { slug: "react",        color: "#61DAFB" },
  "Kotlin":        { slug: "kotlin",       color: "#7F52FF" },
  "Node.js":       { slug: "nodedotjs",    color: "#339933" },
  "Supabase":      { slug: "supabase",     color: "#3FCF8E" },
  "Cloudflare":    { slug: "cloudflare",   color: "#F38020" },
  "Vercel":        { slug: "vercel",       color: "#ffffff", light: true },
  "Cursor AI":     { slug: "cursor",       color: "#ffffff", light: true },
  "Claude":        { slug: "claude",       color: "#D97757" },
  "Codex":         { color: "#ffffff", light: true, svg: `<svg viewBox="0 0 24 24" fill="#ffffff"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z"/></svg>` },
};

const LEVELS: Record<string, number> = {
  "HTML": 70,
  "CSS": 70,
  "JavaScript": 70,
  "jQuery": 65,
  "React": 60,
  "Next.js": 50,
  "TypeScript": 50,
  "Tailwind CSS": 40,
  "Framer Motion": 50,
  "GSAP": 50,
  "Sass": 50,
  "Swiper": 50,
  "Figma": 80,
  "Photoshop": 80,
  "Git": 60,
  "Vite": 50,
  "Electron": 65,
  "React Native": 10,
  "Kotlin": 20,
  "Node.js": 60,
  "Supabase": 50,
  "Cloudflare": 50,
  "Vercel": 50,
  "Cursor AI": 100,
  "Claude": 100,
  "Codex": 100,
};

const GROUPS = [
  { label: "Frontend",      skills: ["HTML","CSS","JavaScript","jQuery","React","Next.js","TypeScript","Tailwind CSS","Framer Motion","GSAP","Sass","Swiper"] },
  { label: "Design",        skills: ["Figma","Photoshop"] },
  { label: "Tools & DX",    skills: ["Git","Vite","Electron"] },
  { label: "Mobile",        skills: ["React Native","Kotlin"] },
  { label: "Backend/Infra", skills: ["Node.js","Supabase","Cloudflare","Vercel"] },
  { label: "AI",            skills: ["Cursor AI","Claude","Codex"] },
];

const ALL_SKILLS = GROUPS.flatMap((g) => g.skills);
const TABS = [{ label: "전체", skills: ALL_SKILLS }, ...GROUPS];
const USED_IN_PROJECTS = new Set(PROJECTS.flatMap((p) => p.tech));

function Icon({ name }: { name: string }) {
  const info = ICONS[name];
  if (!info) return null;
  const invert = info.light ? "icon-on-light" : "";
  if (info.svg) return (
    <span className={invert} dangerouslySetInnerHTML={{ __html: info.svg.replace("<svg ", `<svg width="40" height="40" `) }} />
  );
  return <Image src={`https://cdn.simpleicons.org/${info.slug}/${info.color.replace("#", "")}`} width={40} height={40} alt={name} unoptimized className={`object-contain ${invert}`} />;
}

const PROXIMITY_RADIUS = 140;

function SkillCard({ name, i, featured, onHover }: { name: string; i: number; featured: boolean; onHover: (name: string | null) => void }) {
  const info = ICONS[name];
  const level = LEVELS[name] ?? 70;
  const color = info?.light ? "var(--fg)" : (info?.color ?? "var(--accent)");
  const [open, setOpen] = useState(false);
  const [live, setLive] = useState(false); 
  const [touch, setTouch] = useState(false);
  const openRef = useRef(false); 

  useEffect(() => {
    // 터치 기기 감지
    const mq = window.matchMedia("(hover: none)");
    const sync = () => {
      const coarse = mq.matches;
      setTouch(coarse);
      if (coarse) setLive(true);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const shown = open || touch;

  return (
    <div
      data-skill-card
      className={`glass-panel group relative flex flex-col items-center overflow-hidden rounded-2xl ${featured ? "gap-3 px-4 py-7" : "gap-1.5 px-2 py-3"}`}
      style={{
        "--icon-color": color,
        transition: "transform 150ms ease-out, border-color 200ms, box-shadow 250ms",
        animation: `cardIn 350ms ease-out ${i * 40}ms both`,
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        openRef.current = true;
        setOpen(true);
        setLive(true);
        onHover(name);
        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--icon-color) 45%, transparent)";
        e.currentTarget.style.boxShadow = "0 0 32px -8px var(--icon-color)";
      }}
      onMouseLeave={(e) => {
        openRef.current = false;
        setOpen(false);
        onHover(null);
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* 숙련도 wave */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 overflow-hidden transition-[height] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ height: shown ? `${level}%` : 0 }}
        onTransitionEnd={(e) => {
          if (e.propertyName === "height" && !openRef.current && !touch) setLive(false);
        }}
      >
        {live && (
          <Wave
            fill={`color-mix(in srgb, ${color} 42%, transparent)`}
            paused={!shown}
            options={{ height: 0, amplitude: 20, speed: 0.08, points: 3 }}
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        )}
      </div>
      <span
        className="pointer-events-none absolute right-2.5 top-2.5 z-[1] text-[10px] tabular-nums text-ink/55 transition-opacity duration-300"
        style={{ opacity: shown ? 1 : 0 }}
      >
        {level}%
      </span>
      <div className={`relative z-[1] opacity-85 transition-opacity group-hover:opacity-100 ${featured ? "" : "scale-[0.62]"}`}>
        <Icon name={name} />
      </div>
      <span className={`relative z-[1] text-center leading-tight text-ink/50 transition-colors group-hover:text-ink/80 ${featured ? "text-xs" : "text-[10px]"}`}>{name}</span>
    </div>
  );
}

function SkillGrid({ skills, onHover }: { skills: string[]; onHover: (name: string | null) => void }) {
  const featured = skills.filter((name) => USED_IN_PROJECTS.has(name));
  const rest = skills.filter((name) => !USED_IN_PROJECTS.has(name));
  return (
    <div className="flex flex-col gap-3">
      {featured.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-4">
          {featured.map((name, i) => (
            <SkillCard key={name} name={name} i={i} featured onHover={onHover} />
          ))}
        </div>
      )}
      {rest.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-2">
          {rest.map((name, i) => (
            <SkillCard key={name} name={name} i={featured.length + i} featured={false} onHover={onHover} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Skills() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
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


    const pad = 12;
    const sRect = scroller.getBoundingClientRect();
    const tRect = tab.getBoundingClientRect();
    if (tRect.left < sRect.left + pad) {
      scroller.scrollBy({ left: tRect.left - sRect.left - pad, behavior: "smooth" });
    } else if (tRect.right > sRect.right - pad) {
      scroller.scrollBy({ left: tRect.right - sRect.right + pad, behavior: "smooth" });
    }
  }, [active]);

  // Skills 섹션 진입 시 전체부터 보이도록 리셋
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

  const tab = TABS[active];
  const showAll = active === 0;

  return (
    <section className="pl-[var(--content-pl)] pr-[var(--content-pr)] pt-[var(--header-space)] pb-24 sm:pb-12">
      <div className="mx-auto mb-8 flex max-w-[var(--content-max)] flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="section-title">Skills</h2>
        <p className="section-desc text-sm sm:text-base">각 카드에 호버링하면 숙련도와 사용 프로젝트를 확인할 수 있어요.</p>
      </div>

      <div
        ref={tabScrollRef}
        className="mx-auto mb-10 flex max-w-[var(--content-max)] justify-start gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "none" }}
      >
        {TABS.map((g, i) => {
          const isActive = active === i;
          return (
            <button
              key={g.label}
              ref={(el) => { tabRefs.current[i] = el; }}
              onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
              className="glass-panel shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 sm:text-[15px]"
              style={{
                color: isActive ? "var(--accent)" : "color-mix(in srgb, var(--fg) 45%, transparent)",
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
            key={tab.label}
            ref={gridRef}
            custom={dir}
            initial={{ opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {showAll ? (
              <div className="flex flex-col gap-10">
                {GROUPS.map((g) => (
                  <div key={g.label}>
                    <h3 className="mb-4 text-[13px] font-medium tracking-wide text-ink/40">{g.label}</h3>
                    <SkillGrid skills={g.skills} onHover={setHoveredSkill} />
                  </div>
                ))}
              </div>
            ) : (
              <SkillGrid skills={tab.skills} onHover={setHoveredSkill} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 스킬 사용 현황 패널 — SectionSlider transform 바깥에 포털 */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {hoveredSkill && (SKILL_DETAILS.get(hoveredSkill)?.length ?? 0) > 0 && (() => {
            const details = SKILL_DETAILS.get(hoveredSkill)!;
            const info = ICONS[hoveredSkill];
            const color = info?.light ? "var(--fg)" : (info?.color ?? "var(--accent)");
            return (
              <div
                key={hoveredSkill}
                className="pointer-events-none fixed bottom-6 left-1/2 z-[300] hidden sm:block"
                style={{ transform: "translateX(-50%)" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="w-max max-w-[92vw] overflow-hidden rounded-2xl"
                  style={{
                    background: "var(--skill-panel-bg)",
                    backdropFilter: "blur(32px) saturate(160%)",
                    WebkitBackdropFilter: "blur(32px) saturate(160%)",
                    border: "0.5px solid var(--glass-border-ios)",
                    boxShadow: "var(--skill-panel-shadow)",
                  }}
                >
                  {/* 헤더 */}
                  <div className="flex items-center gap-3 border-b border-ink/[0.08] px-5 py-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center [&_img]:!w-6 [&_img]:!h-6">
                      <Icon name={hoveredSkill} />
                    </span>
                    <p className="text-base font-semibold text-ink/90">{hoveredSkill}</p>
                    <p className="ml-auto text-[12px] text-ink/35">{details.length}개 프로젝트</p>
                  </div>
                  {/* 프로젝트 목록 — 가로 배열 */}
                  <div className="flex divide-x divide-ink/[0.06]">
                    {details.map((d, idx) => (
                      <div key={d.nameKo + idx} className="flex min-w-0 flex-1 gap-3 px-5 py-4">
                        {d.image && (
                          <div className="relative mt-0.5 h-12 w-[4.5rem] shrink-0 overflow-hidden rounded-lg">
                            <Image src={d.image} alt={d.nameKo} fill sizes="72px" className="object-cover object-top" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="mb-1.5 flex items-center gap-2">
                            <span className="whitespace-nowrap text-base font-medium text-ink/80">{d.nameKo}</span>
                            <span className="ml-auto shrink-0 text-[12px] text-ink/30">{d.year}</span>
                          </div>
                          <p className="line-clamp-2 text-[13px] leading-relaxed" style={{ color: `color-mix(in srgb, ${color} 80%, var(--fg))` }}>{d.usage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
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
  "HTML": { slug: "html5", color: "#E34F26" },
  "CSS": { slug: "css", color: "#1572B6" },
  "JavaScript": { slug: "javascript", color: "#F7DF1E" },
  "jQuery": { slug: "jquery", color: "#0769AD" },
  "React": { slug: "react", color: "#61DAFB" },
  "Next.js": { slug: "nextdotjs", color: "#ffffff", light: true },
  "TypeScript": { slug: "typescript", color: "#3178C6" },
  "Tailwind CSS": { slug: "tailwindcss", color: "#06B6D4" },
  "Framer Motion": { slug: "framer", color: "#0055FF" },
  "GSAP": { slug: "greensock", color: "#88CE02" },
  "Sass": { slug: "sass", color: "#CC6699" },
  "Swiper": { slug: "swiper", color: "#6330F4" },
  "Figma": { slug: "figma", color: "#F24E1E" },
  "Photoshop": { color: "#31A8FF", svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#001E36"/><text x="12" y="16.5" text-anchor="middle" font-family="Arial" font-weight="700" font-size="11" fill="#31A8FF">Ps</text></svg>` },
  "Git": { slug: "git", color: "#F05032" },
  "Vite": { slug: "vite", color: "#646CFF" },
  "Electron": { slug: "electron", color: "#47848F" },
  "Node.js": { slug: "nodedotjs", color: "#339933" },
  "Supabase": { slug: "supabase", color: "#3FCF8E" },
  "Cloudflare": { slug: "cloudflare", color: "#F38020" },
  "Vercel": { slug: "vercel", color: "#ffffff", light: true },
  "Cursor AI": { slug: "cursor", color: "#ffffff", light: true },
  "Claude": { slug: "claude", color: "#D97757" },
  "Codex": { color: "#ffffff", light: true, svg: `<svg viewBox="0 0 24 24" fill="#ffffff"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z"/></svg>` },
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
  "Node.js": 60,
  "Supabase": 50,
  "Cloudflare": 50,
  "Vercel": 50,
  "Cursor AI": 100,
  "Claude": 100,
  "Codex": 100,
};

const GROUPS = [
  {
    label: "Frontend",
    skills: ["HTML", "CSS", "JavaScript", "jQuery", "React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "GSAP", "Sass", "Swiper"],
  },
  {
    label: "Design",
    skills: ["Figma", "Photoshop"],
  },
  {
    label: "Tools & DX",
    skills: ["Git", "Vite", "Electron"],
  },
  {
    label: "Backend/Infra",
    skills: ["Node.js", "Supabase", "Cloudflare", "Vercel"],
  },
  {
    label: "AI",
    skills: ["Cursor AI", "Claude", "Codex"],
  },
];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const info = ICONS[name];
  if (!info) return null;
  const invert = info.light ? "icon-on-light" : "";
  if (info.svg) return (
    <span className={invert} dangerouslySetInnerHTML={{ __html: info.svg.replace("<svg ", `<svg width="${size}" height="${size}" `) }} />
  );
  return <Image src={`https://cdn.simpleicons.org/${info.slug}/${info.color.replace("#", "")}`} width={size} height={size} alt="" unoptimized className={`object-contain ${invert}`} />;
}

function SkillCard({ name, onHover }: { name: string; onHover: (name: string | null) => void }) {
  const info = ICONS[name];
  const color = info?.light ? "var(--fg)" : (info?.color ?? "var(--accent)");

  return (
    <button
      type="button"
      data-skill-card
      className="glass-panel inline-flex w-full items-center justify-center gap-1.5 rounded-full px-2 py-2 text-[12.5px] leading-tight text-ink/70 transition-[border-color,box-shadow,color,transform] duration-200 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:w-auto sm:px-3 sm:py-1.5"
      style={{ "--icon-color": color } as React.CSSProperties}
      onMouseEnter={(e) => {
        onHover(name);
        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--icon-color) 45%, transparent)";
        e.currentTarget.style.boxShadow = "0 0 24px -10px var(--icon-color)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "";
      }}
      onFocus={() => onHover(name)}
      onBlur={() => onHover(null)}
    >
      <span aria-hidden className="flex h-4 w-4 shrink-0 items-center justify-center">
        <Icon name={name} size={15} />
      </span>
      <span className="truncate sm:whitespace-nowrap">{name}</span>
    </button>
  );
}

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    let startTime: number | null = null;
    let animId: number;
    const duration = 400; // ms

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(1 + (target - 1) * ease);
      setCount(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [target]);

  return <>{count}</>;
}

function SkillMeta({ name }: { name: string }) {
  const level = LEVELS[name] ?? 70;
  const info = ICONS[name];
  const color = info?.light ? "var(--fg)" : (info?.color ?? "var(--accent)");

  return (
    <div className="flex items-baseline gap-3">
      <span aria-hidden className="section-title inline-flex size-[1em] shrink-0 items-center justify-center self-center [&_img]:size-full [&_img]:object-contain [&_svg]:size-full">
        <Icon name={name} size={64} />
      </span>
      <span className="section-title shrink-0">{name}</span>
      <span
        className={`inline-block min-w-[3.6ch] font-semibold tabular-nums tracking-tight text-[16px] sm:text-[18px] ${info?.light ? "icon-on-light" : ""}`}
        style={{ color }}
      >
        <AnimatedCounter target={level} />%
      </span>
    </div>
  );
}

function SkillStage({ name, fill = false }: { name: string; fill?: boolean }) {
  const details = SKILL_DETAILS.get(name) ?? [];
  const info = ICONS[name];
  const color = info?.light ? "var(--fg)" : (info?.color ?? "var(--accent)");
  const count = details.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={fill ? "flex h-full flex-col" : ""}
    >
      {!fill && (
        <div className="mb-4">
          <SkillMeta name={name} />
        </div>
      )}
      {count > 0 && (
        <div className="mb-2.5 flex items-center justify-between text-xs font-medium">
          <span className={info?.light ? "icon-on-light" : ""} style={{ color }}>
            {count}개 프로젝트
          </span>
        </div>
      )}
      {details.length > 0 && (
        <div className={`grid grid-cols-2 gap-3 ${fill ? "min-h-0 flex-1 content-start overflow-y-auto overscroll-contain pr-1 pb-1 [scrollbar-width:thin]" : ""}`}>
          {details.map((detail, index) => (
            <article key={detail.nameKo + index} className="glass-panel overflow-hidden rounded-2xl">
              {detail.image && (
                <div className="relative h-28 w-full">
                  <Image src={detail.image} alt={detail.nameKo} fill sizes="240px" className="object-cover object-top" />
                </div>
              )}
              <div className="px-3 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-medium text-ink/85">{detail.nameKo}</p>
                  <span className="shrink-0 text-xs text-ink/35">{detail.year}</span>
                </div>
                <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed" style={{ color: `color-mix(in srgb, ${color} 80%, var(--fg))` }}>{detail.usage}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function Skills() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <section className="pl-[var(--content-pl)] pr-[var(--content-pr)] pt-[var(--header-space)] pb-24 sm:pb-12">
      <div className="mx-auto max-w-[var(--content-max)]" onMouseLeave={() => setHoveredSkill(null)}>
        <div className="mb-10 flex items-baseline justify-between gap-x-6 gap-y-2">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="section-title">Skills</h2>
            <p className="section-desc text-sm sm:text-base">카드에 올리면 오른쪽에서 숙련도와 프로젝트를 볼 수 있어요.</p>
          </div>
          <AnimatePresence mode="wait">
            {hoveredSkill && (
              <motion.div
                key={hoveredSkill}
                className="hidden shrink-0 lg:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <SkillMeta name={hoveredSkill} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-10">
          <div className="@container flex flex-col gap-10">
            {GROUPS.map((group) => (
              <div key={group.label}>
                <h3 className="mb-4 text-[13px] font-medium tracking-wide text-ink/40">{group.label}</h3>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {group.skills.map((name) => (
                    <SkillCard key={name} name={name} onHover={setHoveredSkill} />
                  ))}
                </div>
                <div className="mt-4 lg:hidden">
                  <AnimatePresence mode="wait">
                    {hoveredSkill && group.skills.includes(hoveredSkill) && (
                      <SkillStage key={hoveredSkill} name={hoveredSkill} />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
          <aside className="sticky top-[var(--header-space)] hidden h-[calc(100dvh-var(--header-space)-9rem)] lg:block">
            <AnimatePresence mode="wait">
              {hoveredSkill && <SkillStage key={hoveredSkill} name={hoveredSkill} fill />}
            </AnimatePresence>
          </aside>
        </div>
      </div>
    </section>
  );
}

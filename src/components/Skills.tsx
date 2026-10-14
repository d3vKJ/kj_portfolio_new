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

// AI 도구들은 모든 프로젝트 구현에 적극 활용되었으므로 전체 프로젝트 매핑
const ALL_PROJECTS_DETAILS: SkillDetail[] = PROJECTS.map((p) => ({
  nameKo: p.nameKo,
  year: p.year,
  image: p.image,
  usage: "",
}));

const AI_SKILLS = ["Cursor AI", "Claude Code", "Codex", "Antigravity"];
for (const aiSkill of AI_SKILLS) {
  SKILL_DETAILS.set(aiSkill, ALL_PROJECTS_DETAILS);
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
  "Cursor AI": { slug: "cursor", color: "#ffffff", light: true },
  "Claude Code": {
    color: "#D97757",
    svg: `<svg viewBox="0 0 512 512" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><path d="M447.957 233.579H512v66.176h-64v64.597h-31.723v62.315H384v-62.315h-31.723v62.315H320v-62.315H192v62.315h-32.256v-62.315H128v62.315H95.723v-62.315H64v-64.619H0V233.6h64V106.667h383.957v126.912zm-319.957 0h31.744v-60.736H128v60.736zm224.213 0H384v-60.736h-31.787v60.736z" fill="#d97757"/></svg>`,
  },
  "Codex": {
    color: "#ffffff",
    light: true,
    svg: `<svg viewBox="0 0 512 512" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><g transform="scale(16)"><clipPath id="codex_clip"><path d="M0 0h32v32H0z"/></clipPath><g clip-path="url(#codex_clip)"><path d="M10.781.61a8.134 8.134 0 014.062-.554c1.777.204 3.361.96 4.752 2.267.038.036.092.05.142.038 1.878-.461 3.683-.298 5.415.488l.084.04.205.102c1.81.937 3.107 2.36 3.891 4.264.37.905.557 1.85.561 2.834a7.519 7.519 0 01-.24 2.175.221.221 0 00.054.207 7.978 7.978 0 012.104 3.854c.513 2.535-.014 4.82-1.578 6.854l-.242.293a8.093 8.093 0 01-3.912 2.468.219.219 0 00-.144.136c-.34.981-.682 1.819-1.316 2.656-1.599 2.11-3.95 3.283-6.598 3.268-2.11-.01-3.981-.783-5.613-2.315a.192.192 0 00-.187-.042c-.69.222-1.386.254-2.138.246a7.892 7.892 0 01-3.46-.829 8.088 8.088 0 01-2.862-2.375c-.27-.358-.538-.696-.734-1.094-.271-.55-.491-1.122-.66-1.711a8.139 8.139 0 01-.023-4.085c.01-.032.015-.066.01-.099a.155.155 0 00-.049-.085 7.935 7.935 0 01-1.84-2.936 6.908 6.908 0 01-.444-2.119 9.234 9.234 0 01.251-2.843c.6-1.978 1.745-3.53 3.436-4.657a6.25 6.25 0 011.07-.584c.38-.16.763-.293 1.147-.405a.17.17 0 00.116-.116A8.008 8.008 0 017.513 3.08C8.42 1.952 9.51 1.128 10.781.61zM9.71 11.075a1.13 1.13 0 00-1.964 1.123l2.259 3.953-2.25 3.797a1.132 1.132 0 00-.135.535 1.131 1.131 0 002.081.617l2.587-4.362c.208-.35.21-.786.009-1.139l-2.587-4.524zm7.262 8.32a1.138 1.138 0 00-1.066 1.13c0 .595.471 1.094 1.066 1.13h6.464c.6-.03 1.077-.53 1.077-1.13 0-.6-.477-1.102-1.077-1.131H16.97v.001z" fill="currentColor"/></g></g></svg>`,
  },
  "Antigravity": {
    color: "#3186FF",
    svg: `<svg viewBox="0 0 180 180" fill="none"><path d="M144.248 149.062C151.748 154.688 162.998 150.938 152.685 140.625C121.748 110.625 128.31 28.125 89.8727 28.125C51.4352 28.125 57.9977 110.625 27.0602 140.625C15.8102 151.875 27.9977 154.688 35.4977 149.062C64.5602 129.375 62.6852 94.6875 89.8727 94.6875C117.06 94.6875 115.185 129.375 144.248 149.062Z" fill="#3186FF"/><mask id="ag_mask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="22" y="28" width="136" height="125"><path d="M144.248 149.062C151.748 154.688 162.998 150.938 152.685 140.625C121.748 110.625 128.31 28.125 89.8727 28.125C51.4352 28.125 57.9977 110.625 27.0602 140.625C15.8102 151.875 27.9977 154.688 35.4977 149.062C64.5602 129.375 62.6852 94.6875 89.8727 94.6875C117.06 94.6875 115.185 129.375 144.248 149.062Z" fill="white"/></mask><g mask="url(#ag_mask)"><g filter="url(#ag_f0)"><ellipse cx="36.6225" cy="43.0872" rx="36.6225" ry="43.0872" transform="matrix(-0.112784 0.99362 -0.99362 -0.112781 106.557 -26.4847)" fill="#FFE432"/></g><g filter="url(#ag_f1)"><ellipse cx="155.163" cy="54.9292" rx="47.4118" ry="48.4541" transform="rotate(76.9243 155.163 54.9292)" fill="#FC413D"/></g><g filter="url(#ag_f2)"><ellipse cx="14.6006" cy="65.4425" rx="49.5515" ry="64.192" transform="rotate(74.1257 14.6006 65.4425)" fill="#00B95C"/></g><g filter="url(#ag_f3)"><ellipse cx="14.6006" cy="65.4425" rx="49.5515" ry="64.192" transform="rotate(74.1257 14.6006 65.4425)" fill="#00B95C"/></g><g filter="url(#ag_f4)"><ellipse cx="18.1226" cy="67.414" rx="48.5679" ry="53.4688" transform="rotate(45.6065 18.1226 67.414)" fill="#00B95C"/></g><g filter="url(#ag_f5)"><ellipse cx="121.837" cy="166.945" rx="46.6356" ry="44.9084" transform="rotate(76.9243 121.837 166.945)" fill="#3186FF"/></g><g filter="url(#ag_f6)"><ellipse cx="53.9456" cy="56.8997" rx="53.9456" ry="56.8997" transform="matrix(-0.409539 0.912293 -0.912294 -0.409537 162.811 -25.895)" fill="#FBBC04"/></g><g filter="url(#ag_f7)"><path d="M4.21557 239.063C-25.3231 227.467 25.1577 132.061 37.7105 100.085C50.2634 68.1097 84.3853 51.5888 113.924 63.1848C143.463 74.7809 178.474 138.65 165.921 170.626C153.368 202.601 33.7543 250.659 4.21557 239.063Z" fill="#3186FF"/></g><g filter="url(#ag_f8)"><path d="M183.197 120.315C175.289 129.545 154.652 124.839 137.102 109.803C119.553 94.7668 111.738 75.0955 119.646 65.8656C127.554 56.6357 148.191 61.3423 165.74 76.3782C183.289 91.414 191.105 111.085 183.197 120.315Z" fill="#749BFF"/></g><g filter="url(#ag_f9)"><ellipse cx="148.928" cy="36.7252" rx="71.1018" ry="44.199" transform="rotate(34.0763 148.928 36.7252)" fill="#FC413D"/></g><g filter="url(#ag_f10)"><ellipse cx="37.848" cy="46.0346" rx="38.1008" ry="22.1575" transform="rotate(112.516 37.848 46.0346)" fill="#FFEE48"/></g></g><defs><filter id="ag_f0" x="4.09591" y="-44.1761" width="111.037" height="98.4416" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="6.25234"/></filter><filter id="ag_f1" x="46.2974" y="-53.0009" width="217.731" height="215.86" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="30.2268"/></filter><filter id="ag_f2" x="-100.018" y="-36.7558" width="229.238" height="204.397" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="25.6957"/></filter><filter id="ag_f3" x="-100.018" y="-36.7558" width="229.238" height="204.397" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="25.6957"/></filter><filter id="ag_f4" x="-84.3985" y="-35.003" width="205.042" height="204.834" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="25.6957"/></filter><filter id="ag_f5" x="27.9915" y="71.5493" width="187.691" height="190.791" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="24.4184"/></filter><filter id="ag_f6" x="-11.8808" y="-98.7085" width="201.38" height="197.45" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="22.1301"/></filter><filter id="ag_f7" x="-44.4432" y="19.9522" width="252.513" height="260.404" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="19.7631"/></filter><filter id="ag_f8" x="81.1915" y="25.7722" width="140.46" height="134.637" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="17.6843"/></filter><filter id="ag_f9" x="55.1499" y="-47.2531" width="187.555" height="167.957" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="14.9365"/></filter><filter id="ag_f10" x="-24.2633" y="-27.1515" width="124.223" height="146.372" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="18.4865"/></filter></defs></svg>`,
  },
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
  "Cursor AI": 99,
  "Claude Code": 99,
  "Codex": 99,
  "Antigravity": 99,
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
    skills: ["Node.js", "Supabase", "Cloudflare"],
  },
  {
    label: "AI",
    skills: ["Cursor AI", "Claude Code", "Codex", "Antigravity"],
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
        onHover(null);
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "";
      }}
      onClick={() => onHover(name)}
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
                {detail.usage && (
                  <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed" style={{ color: `color-mix(in srgb, ${color} 80%, var(--fg))` }}>{detail.usage}</p>
                )}
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

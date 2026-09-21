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
    <span dangerouslySetInnerHTML={{ __html: info.svg.replace("<svg ", `<svg width="28" height="28" `) }} />
  );
  return <img src={`https://cdn.simpleicons.org/${info.slug}/${info.color.replace("#", "")}`} width={28} height={28} alt={name} className="object-contain" />;
}

export default function Skills() {
  return (
    <section className="h-full flex flex-col pl-44 pr-10 py-12 overflow-hidden">
      <div className="mb-8 shrink-0">
        <h2 className="text-3xl font-semibold tracking-tight">Skills</h2>
        <p className="mt-1.5 text-white/35 text-xs">사용 가능한 기술 스택</p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-10">
        {GROUPS.map(g => (
          <div key={g.label}>
            <p className="text-[10px] text-white/25 uppercase tracking-[0.2em] mb-4">{g.label}</p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
              {g.skills.map(name => (
                <div
                  key={name}
                  className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.16] transition-all cursor-default group"
                >
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <Icon name={name} />
                  </div>
                  <span className="text-[10px] text-white/45 group-hover:text-white/70 transition-colors text-center leading-tight">{name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

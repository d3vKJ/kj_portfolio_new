"use client";

const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com/d3vkj",
    hoverClass: "social-gh",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.529 2.341 1.087 2.912.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/jinsnation",
    hoverClass:
      "social-ig",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
];

const EMAIL = "nova021206@kakao.com";

export default function Contact() {
  return (
    <section className="flex min-h-full flex-col items-center justify-center px-6 pb-10 pt-[var(--header-space)] text-center">
      <span className="text-[10px] uppercase tracking-[0.35em] text-white/30">Contact</span>

      <h2 className="headline-glow mt-1 max-w-3xl text-[clamp(1.75rem,5vw,3.5rem)] font-bold leading-[1.15] tracking-tight">
        같이 만들어가요
      </h2>

      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/40 sm:text-base">
        많은 사용자들에게 편리함을 제공하고 싶어요.<br />
        함께 만들고 성장할 기회를 기다립니다.
      </p>

      <a
        href={`mailto:${EMAIL}`}
        className="group mt-10 inline-flex max-w-full items-center gap-2 border-b border-white/20 pb-1.5 font-mono text-sm text-white/80 transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] sm:text-2xl"
      >
        <span className="min-w-0 break-all">{EMAIL}</span>
        <svg className="h-4 w-4 shrink-0 text-white/25 transition-colors group-hover:text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </a>

      <div className="mt-8 flex items-center justify-center gap-3">
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            title={s.label}
            className={`glass-ios flex h-11 w-11 items-center justify-center rounded-full text-white/50 transition-all duration-200 ${s.hoverClass}`}
          >
            {s.icon}
          </a>
        ))}
      </div>

      <p className="mt-16 text-xs text-white/20">© 2026 Jang Kyungjin<br/>본 프로젝트는 개인 포트폴리오 목적으로 공개되었습니다.<br/>코드를 무단으로 사용하지 말아주세요.</p>
    </section>
  );
}

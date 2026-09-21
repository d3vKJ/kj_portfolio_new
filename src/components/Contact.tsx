"use client";

const LINKS = [
  {
    label: "Email",
    value: "nova021206@gmail.com",
    href: "mailto:nova021206@gmail.com",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    value: "github.com/d3vkj",
    href: "https://github.com/d3vkj",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.529 2.341 1.087 2.912.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    value: "@jinsnation",
    href: "https://instagram.com/jinsnation",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
];

export default function Contact() {
  return (
    <section className="h-full flex pl-40 overflow-hidden">

      {/* 왼쪽 패널 */}
      <div className="w-[480px] shrink-0 flex flex-col border-r border-white/[0.08] px-12">
        {/* 상단 헤더 */}
        <div className="pt-12 pb-0">
          <h2 className="text-3xl font-semibold tracking-tight">Contact</h2>
        </div>

        {/* 중앙 문구 */}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <p className="text-[2rem] font-semibold whitespace-nowrap tracking-tight leading-tight">
            연락을 기다리고 있겠습니다.
          </p>
          <p className="text-sm text-white/40 leading-6">
            성장의 발판이 되어줄 곳을 찾고 있습니다.<br />
            함께라면 더 나은 것을 만들 수 있다고 믿습니다.
          </p>
        </div>

        {/* 하단 카피 */}
        <p className="text-xs text-white/15 text-center pb-8">© 2026 장경진</p>
      </div>

      {/* 오른쪽: 링크 */}
      <div className="flex-1 flex items-center">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-2.5 px-4">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.2] transition-all group"
            >
              <span className="text-white/35 group-hover:text-white/65 transition-colors shrink-0">{link.icon}</span>
              <span className="text-[10px] text-white/25 w-16 shrink-0 uppercase tracking-widest">{link.label}</span>
              <span className="text-sm text-white/65 group-hover:text-white transition-colors flex-1 truncate">{link.value}</span>
              <svg className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          ))}
        </div>
      </div>

    </section>
  );
}

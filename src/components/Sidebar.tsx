"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { label: "About",    index: 0 },
  { label: "Projects", index: 1 },
  { label: "Skills",   index: 2 },
  { label: "Contact",  index: 3 },
];

const CATEGORIES = ["Web", "Desktop", "Android"] as const;
export type Category = typeof CATEGORIES[number] | "All";

export default function Sidebar() {
  const [active, setActive] = useState<number | null>(null);
  const [inSlider, setInSlider] = useState(false);
  const [category, setCategory] = useState<Category>("All");

  useEffect(() => {
    const onSectionChange = (e: Event) => {
      const { index, inSlider: ins } = (e as CustomEvent).detail;
      setActive(index);
      setInSlider(ins);
    };
    window.addEventListener("section-change", onSectionChange);
    return () => window.removeEventListener("section-change", onSectionChange);
  }, []);

  const goHome = () =>
    window.dispatchEvent(new CustomEvent("navigate-section", { detail: { action: "home" } }));

  const goSection = (index: number) =>
    window.dispatchEvent(new CustomEvent("navigate-section", { detail: { action: "go", index } }));

  const selectCategory = (cat: Category) => {
    setCategory(cat);
    window.dispatchEvent(new CustomEvent("filter-category", { detail: { category: cat } }));
  };

  const showCategory = inSlider && active === 1; // Projects 섹션일 때만

  return (
    <aside
      className="fixed left-0 top-0 h-full z-40 flex flex-col items-start py-8 px-3 w-36"
      style={{
        opacity: inSlider ? 1 : 0,
        transform: inSlider ? "translateX(0)" : "translateX(-12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        pointerEvents: inSlider ? "auto" : "none",
      }}
    >
      {/* 홈 버튼 */}
      <button
        onClick={goHome}
        className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.14] flex items-center justify-center text-[11px] font-semibold text-white/50 hover:text-white hover:bg-white/[0.12] transition-all mb-8"
        title="홈으로"
      >
        KJ
      </button>

      {/* 카테고리 필터 — Projects일 때만 */}
      <div
        className="flex flex-col gap-1 w-full overflow-hidden"
        style={{
          maxHeight: showCategory ? 160 : 0,
          opacity: showCategory ? 1 : 0,
          marginBottom: showCategory ? 24 : 0,
          transition: "max-height 0.35s ease, opacity 0.3s ease, margin-bottom 0.35s ease",
        }}
      >
        <span className="text-[9px] text-white/25 uppercase tracking-widest mb-2 px-1">Category</span>
        {(["All", ...CATEGORIES] as Category[]).map((cat) => {
          const isActive = category === cat;
          return (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className="text-left px-3 py-1.5 rounded-lg text-xs transition-all duration-200 w-full"
              style={{
                color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)",
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 구분선 */}
      {showCategory && <div className="w-full h-px bg-white/[0.08] mb-5" />}

      {/* 섹션 네비 */}
      <nav className="flex flex-col gap-3 w-full">
        <span className="text-[9px] text-white/25 uppercase tracking-widest mb-1 px-1">Section</span>
        {SECTIONS.map((s) => {
          const isActive = active === s.index;
          return (
            <button
              key={s.index}
              onClick={() => goSection(s.index)}
              className="flex items-center gap-2.5 px-1 group"
            >
              <span
                className="block rounded-full shrink-0 transition-all duration-300"
                style={{
                  width:  isActive ? 5 : 3,
                  height: isActive ? 5 : 3,
                  background: isActive ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.25)",
                }}
              />
              <span
                className="text-xs transition-all duration-200"
                style={{ color: isActive ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)" }}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto w-px h-10 bg-white/[0.08] self-center" />
    </aside>
  );
}

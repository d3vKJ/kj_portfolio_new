"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SECTIONS = [
  { label: "About", index: 0 },
  { label: "Projects", index: 1 },
  { label: "Skills", index: 2 },
  { label: "Contact", index: 3 },
];

export default function Header() {
  const [active, setActive] = useState<number | null>(null);
  const [inSlider, setInSlider] = useState(false);
  const [autoHidden, setAutoHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onSectionChange = (e: Event) => {
      const { index, inSlider: ins } = (e as CustomEvent).detail;
      setActive(index);
      setInSlider(ins);
      if (!ins) {
        setAutoHidden(false);
        setMenuOpen(false);
      }
    };
    const onAutoHide = (e: Event) => {
      setAutoHidden(Boolean((e as CustomEvent).detail?.hide));
    };
    window.addEventListener("section-change", onSectionChange);
    window.addEventListener("header-auto-hide", onAutoHide);
    return () => {
      window.removeEventListener("section-change", onSectionChange);
      window.removeEventListener("header-auto-hide", onAutoHide);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // 스크롤로 헤더가 숨겨지면 메뉴도 닫기
  useEffect(() => {
    if (autoHidden) setMenuOpen(false);
  }, [autoHidden]);

  const visible = inSlider && !autoHidden;

  const goHome = () => {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent("navigate-section", { detail: { action: "home" } }));
  };

  const goSection = (index: number) => {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent("navigate-section", { detail: { action: "go", index } }));
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-40"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-16px)",
        transition: "opacity 0.28s ease, transform 0.28s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[var(--header-space)] bg-gradient-to-b from-[#040404]/92 via-[#040404]/5 to-transparent"
      />

      <div className="relative pl-[var(--content-pl)] pr-[var(--content-pr)] pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex h-14 w-full max-w-[var(--content-max)] items-center justify-between gap-3 sm:h-16">
          <button
            onClick={goHome}
            className="group flex shrink-0 items-center opacity-90 transition-opacity duration-200 hover:opacity-100 focus:outline-none"
            title="홈으로"
            aria-label="홈으로"
          >
            <Image
              src="/logo.png"
              alt="JINSNATION"
              width={120}
              height={40}
              className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105 sm:h-9"
              priority
            />
          </button>

          {/* 데스크톱 내비 */}
          <nav className="hidden items-center gap-2 sm:flex" aria-label="섹션 이동">
            {SECTIONS.map((s) => {
              const isActive = active === s.index;
              return (
                <button
                  key={s.index}
                  onClick={() => goSection(s.index)}
                  className="glass-ios rounded-full px-4 py-2 text-[15px] font-medium transition-all duration-200"
                  style={{
                    color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                    background: isActive ? "rgba(255,255,255,0.1)" : undefined,
                    borderColor: isActive ? "rgba(255,255,255,0.24)" : undefined,
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </nav>

          {/* 모바일 햄버거 */}
          <button
            type="button"
            className="glass-ios relative flex h-10 w-10 items-center justify-center rounded-xl sm:hidden"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{menuOpen ? "닫기" : "메뉴"}</span>
            <span className="relative block h-3.5 w-4">
              <span
                className="absolute left-0 block h-0.5 w-full rounded-full bg-white/80 transition-all duration-200"
                style={{
                  top: menuOpen ? "50%" : 0,
                  transform: menuOpen ? "translateY(-50%) rotate(45deg)" : "none",
                }}
              />
              <span
                className="absolute left-0 top-1/2 block h-0.5 w-full -translate-y-1/2 rounded-full bg-white/80 transition-opacity duration-200"
                style={{ opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="absolute left-0 block h-0.5 w-full rounded-full bg-white/80 transition-all duration-200"
                style={{
                  bottom: menuOpen ? "auto" : 0,
                  top: menuOpen ? "50%" : "auto",
                  transform: menuOpen ? "translateY(-50%) rotate(-45deg)" : "none",
                }}
              />
            </span>
          </button>
        </div>

        {/* 모바일 드롭다운 */}
        <div
          className="mx-auto mt-2 w-full max-w-[var(--content-max)] overflow-hidden sm:hidden"
          style={{
            maxHeight: menuOpen ? 280 : 0,
            opacity: menuOpen ? 1 : 0,
            transition: "max-height 0.28s ease, opacity 0.2s ease",
            pointerEvents: menuOpen ? "auto" : "none",
          }}
        >
          <nav
            className="glass-ios flex flex-col gap-1 rounded-2xl p-2"
            aria-label="모바일 섹션 이동"
          >
            {SECTIONS.map((s) => {
              const isActive = active === s.index;
              return (
                <button
                  key={s.index}
                  onClick={() => goSection(s.index)}
                  className="rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors duration-200"
                  style={{
                    color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                    background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {menuOpen && (
        <button
          type="button"
          aria-label="메뉴 닫기"
          className="fixed inset-0 z-[-1] bg-black/30 sm:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}

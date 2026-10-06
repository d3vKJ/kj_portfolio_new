"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

const SECTIONS = [
  { label: "About", index: 0 },
  { label: "Skills", index: 1 },
  { label: "Projects", index: 2 },
  { label: "Contact", index: 3 },
];

export default function Header() {
  const [active, setActive] = useState<number | null>(null);
  const [inSlider, setInSlider] = useState(false); // 슬라이더 진입 여부
  const [autoHidden, setAutoHidden] = useState(false); // 스크롤 중 자동 숨김
  const [menuOpen, setMenuOpen] = useState(false);
  const [kbdReveal, setKbdReveal] = useState(false); // 키보드 포커스 시 표시
  const [onVideo, setOnVideo] = useState(false); // 비디오 배경 활성

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
    const onContactVideo = (e: Event) => {
      setOnVideo(Boolean((e as CustomEvent).detail?.on));
    };
    window.addEventListener("section-change", onSectionChange);
    window.addEventListener("header-auto-hide", onAutoHide);
    window.addEventListener("contact-video", onContactVideo);
    return () => {
      window.removeEventListener("section-change", onSectionChange);
      window.removeEventListener("header-auto-hide", onAutoHide);
      window.removeEventListener("contact-video", onContactVideo);
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

  // 헤더 숨김 시 메뉴 닫기
  useEffect(() => {
    if (autoHidden) setMenuOpen(false);
  }, [autoHidden]);

  // 헤더 표시 조건
  const visible = (inSlider && !autoHidden) || kbdReveal;

  const handleFocus = () => setKbdReveal(true);
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setKbdReveal(false);
    }
  };

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
      className="pointer-events-none fixed inset-x-0 top-0 z-40"
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-16px)",
          transition: "opacity 0.28s ease, transform 0.28s ease",
          pointerEvents: visible ? "auto" : "none",
        }}
      >
      <div
        aria-hidden
        className="header-fade pointer-events-none absolute inset-x-0 top-0 h-[var(--header-space)]"
      />

      <div className="relative pl-[var(--content-pl)] pr-[var(--content-pr)] pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex h-14 w-full max-w-[var(--content-max)] items-center justify-between gap-3 sm:h-16">
          <button
            type="button"
            onClick={goHome}
            className="group flex shrink-0 items-center opacity-90 transition-all duration-200 hover:scale-[1.04] hover:opacity-100 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            title="홈으로"
            aria-label="홈으로"
          >
            <Image
              src="/logo.png"
              alt="JINSNATION"
              width={120}
              height={40}
              className={`site-logo h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105 sm:h-9 ${onVideo ? "logo-on-video" : ""}`}
              priority
            />
          </button>

          {/* 데스크톱 내비 */}
          <nav className="hidden items-center gap-2 sm:flex sm:pr-12" aria-label="섹션 이동">
            {SECTIONS.map((s) => {
              const isActive = inSlider && active === s.index;
              return (
                <button
                  key={s.index}
                  type="button"
                  onClick={() => goSection(s.index)}
                  aria-current={isActive ? "page" : undefined}
                  className="glass-ios rounded-full px-4 py-2 text-[15px] font-medium transition-all duration-200 hover:scale-[1.06] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  style={{
                    color: onVideo ? (isActive ? "#fff" : "rgba(255,255,255,0.72)") : isActive ? "var(--fg)" : "color-mix(in srgb, var(--fg) 55%, transparent)",
                    background: onVideo ? (isActive ? "rgba(255,255,255,0.14)" : undefined) : isActive ? "color-mix(in srgb, var(--fg) 10%, transparent)" : undefined,
                    borderColor: onVideo ? (isActive ? "rgba(255,255,255,0.4)" : undefined) : isActive ? "color-mix(in srgb, var(--fg) 24%, transparent)" : undefined,
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
            className="relative flex h-10 w-10 items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:hidden"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="mobile-section-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{menuOpen ? "닫기" : "메뉴"}</span>
            <span className="relative block h-3.5 w-4" aria-hidden>
              <span
                className={`absolute left-0 block h-0.5 w-full rounded-full transition-all duration-200 ${onVideo ? "bg-white/85" : "bg-ink/85"}`}
                style={{
                  top: menuOpen ? "50%" : 0,
                  transform: menuOpen ? "translateY(-50%) rotate(45deg)" : "none",
                }}
              />
              <span
                className={`absolute left-0 top-1/2 block h-0.5 w-full -translate-y-1/2 rounded-full transition-opacity duration-200 ${onVideo ? "bg-white/85" : "bg-ink/85"}`}
                style={{ opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className={`absolute left-0 block h-0.5 w-full rounded-full transition-all duration-200 ${onVideo ? "bg-white/85" : "bg-ink/85"}`}
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
          id="mobile-section-menu"
          className="mx-auto mt-1.5 w-full max-w-[var(--content-max)] overflow-hidden sm:hidden"
          style={{
            maxHeight: menuOpen ? 280 : 0,
            opacity: menuOpen ? 1 : 0,
            transition: "max-height 0.28s ease, opacity 0.2s ease",
            pointerEvents: menuOpen ? "auto" : "none",
          }}
          hidden={!menuOpen}
        >
          <nav
            className="glass-menu flex flex-col gap-0.5 rounded-3xl p-2"
            aria-label="모바일 섹션 이동"
          >
            {SECTIONS.map((s) => {
              const isActive = inSlider && active === s.index;
              return (
                <button
                  key={s.index}
                  type="button"
                  onClick={() => goSection(s.index)}
                  aria-current={isActive ? "page" : undefined}
                  className="rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  style={{
                    color: isActive ? "var(--fg)" : "color-mix(in srgb, var(--fg) 60%, transparent)",
                    background: isActive ? "color-mix(in srgb, var(--fg) 8%, transparent)" : "transparent",
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
          className="fixed inset-0 z-[-1] bg-black/45 sm:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      </div>

      {/* ThemeToggle — 항상 표시 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 pl-[var(--content-pl)] pr-[var(--content-pr)] pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex h-14 w-full max-w-[var(--content-max)] items-center justify-end sm:h-16">
          <div className={visible ? "pointer-events-auto mr-[3.25rem] sm:mr-0" : "pointer-events-auto"}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

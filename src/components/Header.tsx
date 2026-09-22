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

  useEffect(() => {
    const onSectionChange = (e: Event) => {
      const { index, inSlider: ins } = (e as CustomEvent).detail;
      setActive(index);
      setInSlider(ins);
      if (!ins) setAutoHidden(false);
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

  const visible = inSlider && !autoHidden;

  const goHome = () =>
    window.dispatchEvent(new CustomEvent("navigate-section", { detail: { action: "home" } }));

  const goSection = (index: number) =>
    window.dispatchEvent(new CustomEvent("navigate-section", { detail: { action: "go", index } }));

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

          <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="섹션 이동">
            {SECTIONS.map((s) => {
              const isActive = active === s.index;
              return (
                <button
                  key={s.index}
                  onClick={() => goSection(s.index)}
                  className="glass-ios rounded-full px-3 py-1.5 text-[13px] font-medium transition-all duration-200 sm:px-4 sm:py-2 sm:text-[15px]"
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
        </div>
      </div>
    </header>
  );
}

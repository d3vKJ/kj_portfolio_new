"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SECTIONS = [
  { label: "About",    index: 0 },
  { label: "Projects", index: 1 },
  { label: "Skills",   index: 2 },
  { label: "Contact",  index: 3 },
];

export default function Sidebar() {
  const [active, setActive] = useState<number | null>(null);
  const [inSlider, setInSlider] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const trailRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const onSectionChange = (e: Event) => {
      const { index, inSlider: ins } = (e as CustomEvent).detail;
      setActive(index);
      setInSlider(ins);
    };
    window.addEventListener("section-change", onSectionChange);
    return () => window.removeEventListener("section-change", onSectionChange);
  }, []);

  // 활성 점이 다음 섹션으로 이동할 때 살짝 늘어졌다 줄어드는 트레일 모핑
  useEffect(() => {
    if (active === null) return;
    const nav = navRef.current;
    const trail = trailRef.current;
    const btn = btnRefs.current[active];
    if (!nav || !trail || !btn) return;

    const navTop = nav.getBoundingClientRect().top;
    const btnRect = btn.getBoundingClientRect();
    const y = btnRect.top - navTop + btnRect.height / 2 - 2.5;

    trail.style.transition = "transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)";
    trail.style.transform = `translateY(${y}px) scaleY(1.8)`;
    const t = setTimeout(() => {
      trail.style.transition = "transform 220ms ease-out";
      trail.style.transform = `translateY(${y}px) scaleY(1)`;
    }, 150);
    return () => clearTimeout(t);
  }, [active]);

  const goHome = () =>
    window.dispatchEvent(new CustomEvent("navigate-section", { detail: { action: "home" } }));

  const goSection = (index: number) =>
    window.dispatchEvent(new CustomEvent("navigate-section", { detail: { action: "go", index } }));

  return (
    <>
    {/* 모바일(sm 미만): 하단 탭 바 — 좌측 컬럼은 폭이 좁은 화면에서 본문과 겹치므로 별도 레이아웃 사용 */}
    <nav
      className="sm:hidden fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/[0.08] bg-[#0a0a0a]/95 px-2 py-2.5 backdrop-blur"
      style={{
        opacity: inSlider ? 1 : 0,
        transform: inSlider ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        pointerEvents: inSlider ? "auto" : "none",
      }}
      aria-label="섹션 이동"
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.index;
        return (
          <button key={s.index} onClick={() => goSection(s.index)} className="flex flex-col items-center gap-1 px-3 py-1">
            <span
              className="block h-1.5 w-1.5 rounded-full transition-colors duration-300"
              style={{ background: isActive ? "var(--accent)" : "rgba(255,255,255,0.25)" }}
            />
            <span className="text-[10px] transition-colors duration-200" style={{ color: isActive ? "var(--accent)" : "rgba(255,255,255,0.4)" }}>
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>

    {/* 태블릿/데스크톱(sm 이상): 좌측 컬럼 */}
    <aside
      className="hidden sm:flex fixed left-0 top-0 h-full z-40 flex-col items-start py-8 px-3 w-36"
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
        className="group mb-8 flex items-center px-1 opacity-80 transition-opacity duration-200 hover:opacity-100 focus:outline-none"
        title="홈으로"
        aria-label="홈으로"
      >
        <Image
          src="/logo.png"
          alt="JINSNATION"
          width={96}
          height={32}
          className="h-auto w-24 object-contain transition-transform duration-200 group-hover:scale-105"
          priority
        />
      </button>

      {/* 섹션 네비 */}
      <nav ref={navRef} className="relative flex flex-col gap-3 w-full">
        <span
          ref={trailRef}
          aria-hidden
          className="pointer-events-none absolute left-1 top-0 h-[5px] w-[5px] rounded-full"
          style={{ background: "var(--accent)", transform: "translateY(-999px)" }}
        />
        <span className="text-[9px] text-white/25 uppercase tracking-widest mb-1 px-1">Section</span>
        {SECTIONS.map((s) => {
          const isActive = active === s.index;
          return (
            <button
              key={s.index}
              ref={(el) => { btnRefs.current[s.index] = el; }}
              onClick={() => goSection(s.index)}
              className="flex items-center gap-2.5 px-1 group"
            >
              <span
                className="block rounded-full shrink-0 transition-all duration-300"
                style={{
                  width:  isActive ? 5 : 3,
                  height: isActive ? 5 : 3,
                  background: isActive ? "transparent" : "rgba(255,255,255,0.25)",
                }}
              />
              <span
                className="text-xs transition-all duration-200"
                style={{ color: isActive ? "var(--accent)" : "rgba(255,255,255,0.3)" }}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto w-px h-10 bg-white/[0.08] self-center" />
    </aside>
    </>
  );
}

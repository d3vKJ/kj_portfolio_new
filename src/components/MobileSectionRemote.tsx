"use client";

import { useEffect, useState } from "react";

const LABELS = ["About", "Projects", "Skills", "Contact"];
const LAST = LABELS.length - 1;

export default function MobileSectionRemote() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");

    const onScrollState = (e: Event) => {
      const d = (e as CustomEvent).detail as {
        showRemote?: boolean;
        index?: number;
      };
      if (!mq.matches) {
        setVisible(false);
        return;
      }
      setVisible(Boolean(d.showRemote));
      if (typeof d.index === "number") setIndex(d.index);
    };

    const onSectionChange = (e: Event) => {
      const { index: i, inSlider } = (e as CustomEvent).detail as {
        index: number;
        inSlider: boolean;
      };
      if (!inSlider) {
        setVisible(false);
        return;
      }
      setIndex(i);
    };

    const onMq = () => {
      if (!mq.matches) setVisible(false);
    };

    window.addEventListener("slide-scroll-state", onScrollState);
    window.addEventListener("section-change", onSectionChange);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("slide-scroll-state", onScrollState);
      window.removeEventListener("section-change", onSectionChange);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  const goPrev = () => {
    if (index <= 0) return;
    window.dispatchEvent(
      new CustomEvent("navigate-section", { detail: { action: "go", index: index - 1 } }),
    );
  };

  const goNext = () => {
    if (index >= LAST) return;
    window.dispatchEvent(
      new CustomEvent("navigate-section", { detail: { action: "go", index: index + 1 } }),
    );
  };

  const atStart = index === 0;
  const atEnd = index >= LAST;

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center sm:hidden"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.22s ease, transform 0.22s ease",
      }}
      aria-hidden={!visible}
    >
      <div
        className="flex items-center gap-1 rounded-full border border-white/10 bg-[#0c0c10] p-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        role="group"
        aria-label="섹션 이동"
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={atStart}
          tabIndex={visible ? 0 : -1}
          aria-label="이전 섹션"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:bg-white/10 disabled:pointer-events-none disabled:opacity-25"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <span className="min-w-[4.5rem] text-center text-[11px] tracking-[0.14em] text-white/35" aria-live="polite">
          {LABELS[index] ?? ""}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={atEnd}
          tabIndex={visible ? 0 : -1}
          aria-label="다음 섹션"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:bg-white/10 disabled:pointer-events-none disabled:opacity-25"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function MobileTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");

    const sync = (show: boolean) => {
      setVisible(mq.matches && show);
    };

    const onScrollState = (e: Event) => {
      const { showTop } = (e as CustomEvent).detail as { showTop?: boolean };
      sync(Boolean(showTop));
    };

    const onSectionChange = (e: Event) => {
      const { inSlider } = (e as CustomEvent).detail;
      if (!inSlider) sync(false);
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

  const goTop = () =>
    window.dispatchEvent(new CustomEvent("slide-scroll-top"));

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="맨 위로"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className="glass-ios fixed right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:hidden"
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
}

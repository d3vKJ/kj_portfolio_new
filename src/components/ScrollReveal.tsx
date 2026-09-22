"use client";

import { useRef, useEffect, ReactNode } from "react";

export default function ScrollReveal({ children, scrollHeight = "350vh" }: { children: ReactNode; scrollHeight?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const onScroll = () => {
      const { top, height } = wrapper.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -top / (height - window.innerHeight)));

      let opacity: number;
      let tx: number;

      if (progress < 0.18) {
        opacity = progress / 0.18;
        tx = (1 - opacity) * 60;
      } else if (progress < 0.78) {
        opacity = 1;
        tx = 0;
      } else {
        opacity = 1 - (progress - 0.78) / 0.22;
        tx = -(1 - opacity) * 60;
      }

      content.style.opacity = String(Math.max(0, opacity));
      content.style.transform = `translateX(${tx}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={wrapperRef} style={{ height: scrollHeight }} className="relative">
      <div
        ref={contentRef}
        className="sticky top-0 h-screen overflow-auto"
        style={{ opacity: 0, transform: "translateX(80px)" }}
      >
        {children}
      </div>
    </div>
  );
}

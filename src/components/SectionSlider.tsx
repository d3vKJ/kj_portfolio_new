"use client";

import { Children, ReactNode, useEffect, useRef, useState } from "react";

function emitChange(index: number, inSlider: boolean) {
  window.dispatchEvent(new CustomEvent("section-change", { detail: { index, inSlider } }));
}

const SLIDE_MS = 650;
const WHEEL_COOLDOWN_MS = 350;
/** 히어로 → About 진입 직후, 관성 스크롤로 다음 섹션 넘어가지 않게 */
const ENTER_HOLD_MS = 1100;
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

export default function SectionSlider({ children }: { children: ReactNode }) {
  const slides = Children.toArray(children);
  const n = slides.length;
  const [cur, setCur] = useState(0);
  const [locked, setLocked] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [reveal, setReveal] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const s = useRef({
    locked: false,
    animating: false,
    cur: 0,
    cooldown: false,
    reduceMotion: false,
    reveal: 0,
    wheelLockUntil: 0,
  });

  useEffect(() => {
    s.current.cur = cur;
    if (s.current.locked) emitChange(cur, true);
  }, [cur]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    s.current.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    const runTransition = async (next: number) => {
      if (s.current.animating || next === s.current.cur) return;
      if (next < 0 || next >= n) return;

      s.current.animating = true;
      s.current.wheelLockUntil = Infinity;

      const duration = s.current.reduceMotion ? 280 : SLIDE_MS;
      setSliding(true);
      await wait(16);
      setCur(next);
      s.current.cur = next;
      await wait(duration);

      setSliding(false);
      s.current.animating = false;
      s.current.wheelLockUntil = performance.now() + WHEEL_COOLDOWN_MS;
    };

    const lock = () => {
      if (s.current.locked || s.current.cooldown) return;
      s.current.locked = true;
      setLocked(true);
      setReveal(1);
      s.current.reveal = 1;
      s.current.wheelLockUntil = performance.now() + ENTER_HOLD_MS;

      const top = window.scrollY + sentinel.getBoundingClientRect().top;
      window.scrollTo(0, top);
      document.body.style.cssText =
        `position:fixed;top:-${top}px;width:100%;overflow:hidden`;
      emitChange(s.current.cur, true);
    };

    const unlock = () => {
      s.current.locked = false;
      s.current.cooldown = true;
      setLocked(false);
      setReveal(0);
      s.current.reveal = 0;
      document.body.style.cssText = "";
      emitChange(s.current.cur, false);
      window.dispatchEvent(new CustomEvent("hero-crossfade", { detail: { t: 0 } }));
      setTimeout(() => { s.current.cooldown = false; }, 500);
    };

    const onCrossfade = (e: Event) => {
      if (s.current.locked || s.current.cooldown) return;
      const t = Math.max(0, Math.min(1, (e as CustomEvent).detail.t as number));
      s.current.reveal = t;
      setReveal(t);
      if (t >= 0.995) lock();
    };

    const check = () => {
      if (s.current.locked || s.current.cooldown) return;
      if (s.current.reveal >= 0.995) {
        lock();
        return;
      }
      const r = sentinel.getBoundingClientRect();
      if (r.top <= 0 && r.bottom >= window.innerHeight) lock();
    };

    const onWheel = (e: WheelEvent) => {
      if (!s.current.locked) return;

      if (s.current.animating || performance.now() < s.current.wheelLockUntil) {
        e.preventDefault();
        return;
      }

      const down = e.deltaY > 0;

      if (down && s.current.cur < n - 1) {
        e.preventDefault();
        void runTransition(s.current.cur + 1);
      } else if (!down && s.current.cur > 0) {
        e.preventDefault();
        void runTransition(s.current.cur - 1);
      } else if (!down && s.current.cur === 0) {
        e.preventDefault();
        unlock();
        window.scrollTo(0, 0);
        window.dispatchEvent(new Event("scroll"));
        setTimeout(() => { s.current.cooldown = false; }, 500);
      } else if (down && s.current.cur === n - 1) {
        e.preventDefault();
      }
    };

    const onNavigate = (e: Event) => {
      const { action, index } = (e as CustomEvent).detail;
      if (action === "home") {
        if (!s.current.locked) return;
        unlock();
        window.scrollTo(0, 0);
        window.dispatchEvent(new Event("scroll"));
        setTimeout(() => { s.current.cooldown = false; }, 500);
      } else if (action === "go" && typeof index === "number") {
        if (!s.current.locked) {
          setReveal(1);
          s.current.reveal = 1;
          lock();
          void runTransition(index);
        } else {
          void runTransition(index);
        }
      }
    };

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("navigate-section", onNavigate);
    window.addEventListener("hero-crossfade", onCrossfade);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("navigate-section", onNavigate);
      window.removeEventListener("hero-crossfade", onCrossfade);
      if (s.current.locked) {
        s.current.locked = false;
        document.body.style.cssText = "";
      }
    };
  }, [n]);

  const showLayer = locked || reveal > 0.001;

  return (
    <>
      <div ref={sentinelRef} className="relative h-screen bg-black" aria-hidden />

      <div
        className="fixed inset-0 z-10 overflow-hidden bg-black"
        style={{
          opacity: locked ? 1 : reveal,
          visibility: showLayer ? "visible" : "hidden",
          pointerEvents: locked ? "auto" : "none",
        }}
      >
        {locked && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === cur ? "w-6 bg-white/50" : "w-1.5 bg-white/20"}`}
              />
            ))}
          </div>
        )}

        <div
          className="flex h-full"
          style={{
            width: `${n * 100}vw`,
            transform: `translateX(-${cur * 100}vw)`,
            transition: sliding ? `transform ${SLIDE_MS}ms ${EASE}` : "none",
          }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="h-full overflow-auto" style={{ width: "100vw" }}>
              {slide}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

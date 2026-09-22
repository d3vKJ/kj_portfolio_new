"use client";

import { Children, ReactNode, useEffect, useRef, useState } from "react";

/** 현재 슬라이드가 아직 끝까지 스크롤되지 않았다면 true — 이 경우 휠을 섹션 전환 대신 내부 스크롤에 양보한다 */
function hasScrollRoom(el: HTMLElement, down: boolean) {
  if (el.scrollHeight <= el.clientHeight + 1) return false;
  return down ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 1;
}

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
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
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
    const state = s.current;

    state.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      bindSlideScroll();
    };

    const emitHeaderHide = () => {
      const el = slideRefs.current[s.current.cur];
      const mobile = window.matchMedia("(max-width: 639px)").matches;
      const scrollTop = el?.scrollTop ?? 0;
      // Projects: 항상 / About: 모바일에서만 스크롤 시 헤더 숨김
      const hideOnScroll = s.current.cur === 1 || (s.current.cur === 0 && mobile);
      const hide = s.current.locked && hideOnScroll && scrollTop > 32;
      window.dispatchEvent(new CustomEvent("header-auto-hide", { detail: { hide } }));
      window.dispatchEvent(
        new CustomEvent("slide-scroll-state", {
          detail: { showTop: s.current.locked && mobile && scrollTop > 80 },
        }),
      );
    };

    const onSlideScroll = () => emitHeaderHide();

    const bindSlideScroll = () => {
      slideRefs.current.forEach((el) => {
        el?.removeEventListener("scroll", onSlideScroll);
      });
      const active = slideRefs.current[s.current.cur];
      active?.addEventListener("scroll", onSlideScroll, { passive: true });
      emitHeaderHide();
    };

    const onScrollTop = () => {
      const el = slideRefs.current[s.current.cur];
      el?.scrollTo({ top: 0, behavior: "smooth" });
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
      bindSlideScroll();
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
      window.dispatchEvent(new CustomEvent("header-auto-hide", { detail: { hide: false } }));
      window.dispatchEvent(new CustomEvent("slide-scroll-state", { detail: { showTop: false } }));
      slideRefs.current.forEach((el) => el?.removeEventListener("scroll", onSlideScroll));
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
      // 모바일은 Slide to enter로만 진입 — 위로 스와이프 스크롤로 sentinel 잠금 방지
      if (window.matchMedia("(max-width: 639px)").matches) return;
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

      const activeSlide = slideRefs.current[s.current.cur];
      if (activeSlide && hasScrollRoom(activeSlide, down)) {
        return;
      }

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
    window.addEventListener("slide-scroll-top", onScrollTop);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("navigate-section", onNavigate);
      window.removeEventListener("hero-crossfade", onCrossfade);
      window.removeEventListener("slide-scroll-top", onScrollTop);
      slideRefs.current.forEach((el) => el?.removeEventListener("scroll", onSlideScroll));
      if (state.locked) {
        state.locked = false;
        document.body.style.cssText = "";
      }
    };
  }, [n]);

  const showLayer = locked || reveal > 0.001;

  return (
    <>
      <div ref={sentinelRef} className="relative h-[100dvh] bg-transparent" aria-hidden />

      <div
        className="fixed left-0 top-0 z-10 w-full overflow-hidden bg-transparent"
        style={{
          height: "100dvh",
          opacity: locked ? 1 : reveal,
          visibility: showLayer ? "visible" : "hidden",
          pointerEvents: locked ? "auto" : "none",
        }}
      >
        <div
          className="flex h-full"
          style={{
            width: `${n * 100}vw`,
            transform: `translateX(-${cur * 100}vw)`,
            transition: sliding ? `transform ${SLIDE_MS}ms ${EASE}` : "none",
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              ref={(el) => { slideRefs.current[i] = el; }}
              className="h-full overflow-auto"
              style={{ width: "100vw" }}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

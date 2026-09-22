"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const LOGO_OUT_END = 0.1;
const VIDEO_IN_START = 0.1;
const VIDEO_IN_END = 0.2;
const SCRUB_END = 0.9;
const FADE_OUT_END = 0.96;
const ENTER_MS = 1000;

type HeroMode = "phone" | "tablet" | "desktop";

function emitCrossfade(t: number) {
  window.dispatchEvent(new CustomEvent("hero-crossfade", { detail: { t } }));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function getHeroMode(): HeroMode {
  if (window.matchMedia("(min-width: 1024px)").matches) return "desktop";
  if (window.matchMedia("(max-width: 639px)").matches) return "phone";
  return "tablet";
}

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const lastT = useRef(-1);
  const readyRef = useRef(false);
  const enteringRef = useRef(false);
  const [mode, setMode] = useState<HeroMode>("desktop");

  const touchSectionRef = useRef<HTMLElement>(null);
  const touchEnteringRef = useRef(false);
  const unlockTrackRef = useRef<HTMLDivElement>(null);
  const unlockThumbRef = useRef<HTMLButtonElement>(null);
  const unlockLabelRef = useRef<HTMLSpanElement>(null);
  const unlockDrag = useRef({ active: false, startX: 0, x: 0, max: 0 });

  useEffect(() => {
    const sync = () => setMode(getHeroMode());
    sync();
    const mqPhone = window.matchMedia("(max-width: 639px)");
    const mqDesktop = window.matchMedia("(min-width: 1024px)");
    mqPhone.addEventListener("change", sync);
    mqDesktop.addEventListener("change", sync);
    return () => {
      mqPhone.removeEventListener("change", sync);
      mqDesktop.removeEventListener("change", sync);
    };
  }, []);

  // 데스크톱: 로고 틸트
  useEffect(() => {
    if (mode !== "desktop") return;
    const sticky = stickyRef.current;
    const logo = logoRef.current;
    if (!sticky || !logo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const rx = ((e.clientY / innerHeight) - 0.5) * -8;
      const ry = ((e.clientX / innerWidth) - 0.5) * 8;
      logo.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };

    sticky.addEventListener("mousemove", onMove);
    return () => sticky.removeEventListener("mousemove", onMove);
  }, [mode]);

  // 데스크톱: 영상 스크럽
  useEffect(() => {
    if (mode !== "desktop") return;
    const video = videoRef.current;
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    const sticky = stickyRef.current;
    if (!video || !section || !overlay || !sticky) return;

    let targetTime = 0;
    let rafPending = false;
    let enterRaf = 0;

    const seek = () => {
      rafPending = false;
      if (!isFinite(video.duration)) return;
      const el = video as HTMLVideoElement & { fastSeek?: (t: number) => void };
      if (typeof el.fastSeek === "function") el.fastSeek(targetTime);
      else el.currentTime = targetTime;
    };

    const setCrossfade = (t: number) => {
      sticky.style.opacity = String(1 - t);
      if (Math.abs(t - lastT.current) > 0.004 || (t === 0 && lastT.current !== 0) || t === 1) {
        lastT.current = t;
        emitCrossfade(t);
      }
    };

    const runEnter = () => {
      if (enteringRef.current) return;
      enteringRef.current = true;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dur = reduce ? 280 : ENTER_MS;
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        setCrossfade(easeOutCubic(t));
        if (t < 1) enterRaf = requestAnimationFrame(tick);
        else enteringRef.current = false;
      };
      enterRaf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (!readyRef.current || enteringRef.current) return;
      if (e.deltaY <= 0) return;
      e.preventDefault();
      runEnter();
    };

    const onScroll = () => {
      if (enteringRef.current) return;

      const { top, height } = section.getBoundingClientRect();
      const range = height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -top / range));

      if (progress >= FADE_OUT_END) {
        const snapY = window.scrollY + top + FADE_OUT_END * range;
        if (!readyRef.current) {
          readyRef.current = true;
          window.scrollTo(0, snapY);
        } else if (Math.abs(window.scrollY - snapY) > 2) {
          window.scrollTo(0, snapY);
        }
        video.style.opacity = "0";
        overlay.style.opacity = "0";
        setCrossfade(0);
        return;
      }

      if (readyRef.current) {
        readyRef.current = false;
        setCrossfade(0);
      }

      const scrubProgress = Math.max(
        0,
        Math.min(1, (progress - VIDEO_IN_END) / (SCRUB_END - VIDEO_IN_END)),
      );
      targetTime = scrubProgress * (video.duration || 0);

      overlay.style.opacity = String(Math.max(0, 1 - progress / LOGO_OUT_END));

      let videoOpacity = 0;
      if (progress < VIDEO_IN_START) {
        videoOpacity = 0;
      } else if (progress < VIDEO_IN_END) {
        videoOpacity = (progress - VIDEO_IN_START) / (VIDEO_IN_END - VIDEO_IN_START);
      } else if (progress < SCRUB_END) {
        videoOpacity = 1;
      } else if (progress < FADE_OUT_END) {
        videoOpacity = 1 - (progress - SCRUB_END) / (FADE_OUT_END - SCRUB_END);
      }

      const scaleProgress = Math.min(1, progress / SCRUB_END);
      video.style.opacity = String(videoOpacity);
      video.style.transform = `scale(${0.5 + 0.5 * scaleProgress})`;
      sticky.style.opacity = "1";

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(seek);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      if (enterRaf) cancelAnimationFrame(enterRaf);
    };
  }, [mode]);

  // 폰/태블릿: 스크롤로 섹션 넘어가는 것 차단
  useEffect(() => {
    if (mode === "desktop") return;

    let blockScroll = true;

    const freezePage = () => {
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    };

    const unfreezePage = () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };

    const resetTouchHero = () => {
      const thumb = unlockThumbRef.current;
      const label = unlockLabelRef.current;
      const section = touchSectionRef.current;
      if (thumb) thumb.style.transform = "translateX(0)";
      if (label) label.style.opacity = "1";
      if (section) section.style.opacity = "1";
      unlockDrag.current = { active: false, startX: 0, x: 0, max: unlockDrag.current.max };
      touchEnteringRef.current = false;
    };

    const onSection = (e: Event) => {
      const inSlider = Boolean((e as CustomEvent).detail?.inSlider);
      if (inSlider) {
        blockScroll = false;
        document.body.style.touchAction = "";
      } else {
        blockScroll = true;
        resetTouchHero();
        freezePage();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!blockScroll) return;
      if (unlockDrag.current.active) return;
      e.preventDefault();
    };

    freezePage();
    window.addEventListener("section-change", onSection);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      unfreezePage();
      window.removeEventListener("section-change", onSection);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [mode]);

  // 폰: Slide to enter
  useEffect(() => {
    if (mode !== "phone") return;
    const track = unlockTrackRef.current;
    const thumb = unlockThumbRef.current;
    const label = unlockLabelRef.current;
    const section = touchSectionRef.current;
    if (!track || !thumb) return;

    const measure = () => {
      unlockDrag.current.max = Math.max(0, track.clientWidth - thumb.offsetWidth - 8);
    };
    measure();

    const finishEnter = (from: number) => {
      if (touchEnteringRef.current) return;
      touchEnteringRef.current = true;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dur = reduce ? 220 : 520;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const v = from + (1 - from) * easeOutCubic(t);
        if (section) section.style.opacity = String(1 - v);
        if (thumb) thumb.style.transform = `translateX(${unlockDrag.current.max}px)`;
        if (label) label.style.opacity = "0";
        emitCrossfade(v);
        if (t < 1) requestAnimationFrame(tick);
        else touchEnteringRef.current = false;
      };
      requestAnimationFrame(tick);
    };

    const snapBack = () => {
      const startX = unlockDrag.current.x;
      const start = performance.now();
      const dur = 280;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = easeOutCubic(t);
        const x = startX * (1 - eased);
        unlockDrag.current.x = x;
        if (thumb) thumb.style.transform = `translateX(${x}px)`;
        if (label) label.style.opacity = String(1 - startX / Math.max(1, unlockDrag.current.max) * (1 - eased));
        if (section) section.style.opacity = "1";
        emitCrossfade(0);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const onStart = (clientX: number) => {
      if (touchEnteringRef.current) return;
      measure();
      unlockDrag.current.active = true;
      unlockDrag.current.startX = clientX - unlockDrag.current.x;
      thumb.style.transition = "none";
    };

    const onMove = (clientX: number) => {
      if (!unlockDrag.current.active || touchEnteringRef.current) return;
      const x = Math.max(0, Math.min(unlockDrag.current.max, clientX - unlockDrag.current.startX));
      unlockDrag.current.x = x;
      const p = unlockDrag.current.max > 0 ? x / unlockDrag.current.max : 0;
      thumb.style.transform = `translateX(${x}px)`;
      if (label) label.style.opacity = String(Math.max(0, 1 - p * 1.4));
      if (section) section.style.opacity = String(1 - p * 0.35);
      emitCrossfade(p * 0.55);
    };

    const onEnd = () => {
      if (!unlockDrag.current.active) return;
      unlockDrag.current.active = false;
      const p = unlockDrag.current.max > 0 ? unlockDrag.current.x / unlockDrag.current.max : 0;
      if (p >= 0.72) finishEnter(p * 0.55);
      else snapBack();
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      thumb.setPointerCapture(e.pointerId);
      onStart(e.clientX);
    };
    const onPointerMove = (e: PointerEvent) => onMove(e.clientX);
    const onPointerUp = () => onEnd();

    thumb.addEventListener("pointerdown", onPointerDown);
    thumb.addEventListener("pointermove", onPointerMove);
    thumb.addEventListener("pointerup", onPointerUp);
    thumb.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", measure);
    return () => {
      thumb.removeEventListener("pointerdown", onPointerDown);
      thumb.removeEventListener("pointermove", onPointerMove);
      thumb.removeEventListener("pointerup", onPointerUp);
      thumb.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", measure);
    };
  }, [mode]);

  const goAboutByTap = () => {
    if (touchEnteringRef.current) return;
    touchEnteringRef.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduce ? 280 : ENTER_MS;
    const start = performance.now();
    const section = touchSectionRef.current;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = easeOutCubic(t);
      if (section) section.style.opacity = String(1 - eased);
      emitCrossfade(eased);
      if (t < 1) requestAnimationFrame(tick);
      else touchEnteringRef.current = false;
    };
    requestAnimationFrame(tick);
  };

  // 폰: Slide to enter
  if (mode === "phone") {
    return (
      <section
        ref={touchSectionRef}
        className="relative z-20 flex h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#040404] will-change-[opacity]"
        style={{ touchAction: "none" }}
      >
        <Image src="/logo.png" alt="logo" width={220} height={220} className="object-contain" priority />
        <p className="mt-1 px-4 text-center text-[10px] tracking-[0.12em] uppercase text-white/60">
          Publisher | Front-End | Full-Stack
        </p>

        <div className="absolute inset-x-0 bottom-0 px-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <div
            ref={unlockTrackRef}
            className="unlock-track relative mx-auto flex h-14 w-full max-w-sm items-center overflow-hidden rounded-full px-1"
            aria-label="Slide to enter"
          >
            <span
              ref={unlockLabelRef}
              className="pointer-events-none absolute inset-0 flex items-center justify-center pl-10 text-[13px] tracking-[0.14em] text-white/50"
            >
              Slide to enter
            </span>
            <button
              ref={unlockThumbRef}
              type="button"
              aria-label="Slide to enter"
              className="unlock-thumb relative z-[1] flex h-12 w-12 shrink-0 touch-none items-center justify-center rounded-full"
              style={{ touchAction: "none" }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 태블릿: 탭으로 진입
  if (mode === "tablet") {
    return (
      <section
        ref={touchSectionRef}
        className="relative z-20 h-[100dvh] overflow-hidden bg-[#040404] will-change-[opacity]"
      >
        <button
          type="button"
          onClick={goAboutByTap}
          aria-label="탭해서 About으로 이동"
          className="flex h-full w-full flex-col items-center justify-center"
        >
          <Image src="/logo.png" alt="logo" width={260} height={260} className="object-contain" priority />
          <p className="mt-1 px-4 text-center text-[12px] tracking-[0.2em] uppercase text-white/60">
            Publisher | Front-End | Full-Stack
          </p>

          <div className="absolute bottom-16 flex flex-col items-center gap-2 text-white/40">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-pulse">
              <circle cx="12" cy="12" r="9" strokeOpacity="0.5" />
              <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
            </svg>
            <span className="text-[10px] tracking-[0.2em] uppercase">Tap</span>
          </div>
        </button>
      </section>
    );
  }

  // 데스크톱: 영상 스크럽
  return (
    <section ref={sectionRef} className="relative z-20 h-[850vh]">
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden bg-[#040404] will-change-[opacity]">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0, transform: "scale(0.5)", transformOrigin: "center center" }}
          src="/hero_scrub.mp4"
          muted
          playsInline
          preload="auto"
        />

        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center"
          style={{ transition: "opacity 0.4s ease" }}
        >
          <div ref={logoRef} style={{ transition: "transform 200ms ease-out", transformStyle: "preserve-3d" }}>
            <Image src="/logo.png" alt="logo" width={280} height={280} className="object-contain" priority />
          </div>
          <p className="mt-1 px-4 text-center text-[13px] tracking-[0.3em] uppercase text-white/60">
            Publisher | Front-End | Full-Stack
          </p>

          <div className="absolute bottom-10 flex flex-col items-center gap-2 text-white/40">
            <svg width="16" height="26" viewBox="0 0 16 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.75" y="0.75" width="14.5" height="24.5" rx="7.25" stroke="currentColor" strokeWidth="1.5" />
              <line x1="8" y1="0.75" x2="8" y2="10" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
              <rect x="7" y="5" width="2" height="4" rx="1" fill="currentColor" className="animate-bounce" />
            </svg>
            <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          </div>
        </div>
      </div>
    </section>
  );
}

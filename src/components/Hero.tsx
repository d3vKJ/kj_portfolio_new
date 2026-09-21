"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const LOGO_OUT_END = 0.1;
const VIDEO_IN_START = 0.1;
const VIDEO_IN_END = 0.2;
const SCRUB_END = 0.86;       // 영상 스크럽 종료
const FADE_OUT_END = 0.91;    // 영상 페이드 아웃 → 짧은 블랙
const CROSSFADE_START = 0.93; // 여기부터 About 크로스페이드

function emitCrossfade(t: number) {
  window.dispatchEvent(new CustomEvent("hero-crossfade", { detail: { t } }));
}

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const lastT = useRef(-1);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    const sticky = stickyRef.current;
    if (!video || !section || !overlay || !sticky) return;

    let targetTime = 0;
    let rafPending = false;

    const seek = () => {
      rafPending = false;
      if (!isFinite(video.duration)) return;
      if ("fastSeek" in video) {
        (video as HTMLVideoElement & { fastSeek(t: number): void }).fastSeek(targetTime);
      } else {
        (video as HTMLVideoElement).currentTime = targetTime;
      }
    };

    const onScroll = () => {
      const { top, height } = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -top / (height - window.innerHeight)));

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
      } else {
        videoOpacity = 0;
      }

      const scaleProgress = Math.min(1, progress / SCRUB_END);
      video.style.opacity = String(videoOpacity);
      video.style.transform = `scale(${0.5 + 0.5 * scaleProgress})`;

      // About 크로스페이드: 히어로는 투명해지고, 슬라이더는 고정 레이어로 페이드 인
      let t = 0;
      if (progress >= CROSSFADE_START) {
        t = (progress - CROSSFADE_START) / (1 - CROSSFADE_START);
      }
      sticky.style.opacity = String(1 - t);

      if (Math.abs(t - lastT.current) > 0.004 || (t === 0 && lastT.current !== 0) || t === 1) {
        lastT.current = t;
        emitCrossfade(t);
      }

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(seek);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative z-20 h-[950vh]">
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden bg-black will-change-[opacity]">
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
          <Image src="/logo.png" alt="logo" width={280} height={280} className="object-contain" priority />
          <p
            className="mt-1 text-[13px] tracking-[0.3em] uppercase"
            style={{
              background: "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 55%, rgba(255,255,255,0.2) 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 8s linear infinite",
            }}
          >
            Front End Developer
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

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HERO_VIDEO, HERO_VIDEO_CACHE, HERO_VIDEO_CACHE_FLAG } from "@/data/heroVideo";

// 스크롤 progress(0~1) 타임라인
const LOGO_OUT_END = 0.1;    // 로고 fade out
const VIDEO_IN_START = 0.1;  // 비디오 fade in 시작
const VIDEO_IN_END = 0.2;    // 비디오 fade in 완료
const SCRUB_END = 0.9;       // 비디오 scrub 끝
const FADE_OUT_END = 0.96;   // 비디오 fade out 완료
const ENTER_MS = 1000;

type HeroMode = "phone" | "tablet" | "desktop";

function emitCrossfade(t: number) {
  window.dispatchEvent(new CustomEvent("hero-crossfade", { detail: { t } }));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

const SCROLL_TO_ABOUT_MS = 8000;

async function readVideoBlob(response: Response, onProgress: (ratio: number) => void) {
  const total = Number(response.headers.get("content-length")) || 0;
  if (!response.body) {
    const blob = await response.blob();
    onProgress(1);
    return blob;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.byteLength;
      if (total > 0) onProgress(Math.min(1, received / total));
    }
  }
  onProgress(1);
  return new Blob(chunks as BlobPart[], { type: "video/mp4" });
}

function rememberHeroVideo() {
  try {
    localStorage.setItem(HERO_VIDEO_CACHE_FLAG, HERO_VIDEO);
  } catch {
    /* 저장 불가면 다음에도 로딩 화면을 보여 준다 */
  }
}

function forgetHeroVideo() {
  try {
    localStorage.removeItem(HERO_VIDEO_CACHE_FLAG);
  } catch {
    /* ignore */
  }
  delete document.documentElement.dataset.heroCached;
}

async function openHeroCache() {
  if (!("caches" in window)) return null;
  try {
    return await caches.open(HERO_VIDEO_CACHE);
  } catch {
    return null;
  }
}

function warmHeroVideo(video: HTMLVideoElement) {
  video.muted = true;
  const played = video.play();
  if (!played) return;
  played.then(() => {
    video.pause();
    video.playbackRate = 1;
  }).catch(() => {});
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
  const playingAllRef = useRef(false);
  const playAllFnRef = useRef<(() => void) | null>(null);
  const [mode, setMode] = useState<HeroMode>("desktop");
  const [playingAll, setPlayingAll] = useState(false);
  const [heroHintsVisible, setHeroHintsVisible] = useState(true);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [forceGate, setForceGate] = useState(false);

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

  // 데스크톱: 영상 전체를 받은 뒤에만 사이트를 연다
  useEffect(() => {
    if (mode !== "desktop") return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    let cancelled = false;
    const ac = new AbortController();

    const reveal = () => {
      if (cancelled) return;
      cancelled = true;
      setVideoReady(true);
    };

    const timeout = window.setTimeout(() => {
      setVideoSrc((src) => src ?? HERO_VIDEO);
      reveal();
    }, 12000);

    (async () => {
      try {
        const cache = await openHeroCache();
        const hit = cache ? await cache.match(HERO_VIDEO) : undefined;
        if (hit) {
          const blob = await hit.blob();
          if (cancelled) return;
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob);
            setVideoSrc(url);
            rememberHeroVideo();
            return;
          }
          await cache?.delete(HERO_VIDEO);
        }

        if (document.documentElement.dataset.heroCached === "1") {
          forgetHeroVideo();
          setForceGate(true);
        }

        const res = await fetch(HERO_VIDEO, { signal: ac.signal, cache: "force-cache" });
        if (!res.ok) throw new Error("video");
        const stored = res.clone();
        const blob = await readVideoBlob(res, () => {});
        if (cancelled) return;
        if (cache) {
          await cache.put(HERO_VIDEO, stored);
          rememberHeroVideo();
        }
        const url = URL.createObjectURL(blob);
        setVideoSrc(url);
      } catch {
        if (!cancelled) setVideoSrc(HERO_VIDEO);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
      window.clearTimeout(timeout);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "desktop" || videoReady) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    if (document.documentElement.dataset.heroCached === "1" && !forceGate) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.dataset.heroLoading = "1";

    const blockScroll = (e: Event) => e.preventDefault();
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      delete html.dataset.heroLoading;
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
    };
  }, [mode, videoReady, forceGate]);

  useEffect(() => {
    if (mode !== "desktop" || !videoSrc) return;
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      warmHeroVideo(video);
      setVideoReady(true);
    };

    if (video.readyState >= 2 && Number.isFinite(video.duration)) {
      finish();
      return () => {
        cancelled = true;
      };
    }

    const onReady = () => finish();
    video.addEventListener("loadeddata", onReady);
    const giveUp = window.setTimeout(finish, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(giveUp);
      video.removeEventListener("loadeddata", onReady);
    };
  }, [mode, videoSrc]);

  // 데스크톱: 영상 스크럽
  useEffect(() => {
    if (mode !== "desktop" || !videoReady) return;
    const video = videoRef.current;
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    const sticky = stickyRef.current;
    if (!video || !section || !overlay || !sticky) return;

    let targetTime = 0;
    let scrubRaf = 0;
    let enterRaf = 0;
    let playAllRaf = 0;
    let inSlider = false;
    let isSeeking = false;
    let hintsOn = true;
    let sectionTop = 0;
    let sectionRange = 1;

    const measureSection = () => {
      sectionTop = window.scrollY + section.getBoundingClientRect().top;
      sectionRange = Math.max(1, section.offsetHeight - window.innerHeight);
    };
    measureSection();

    const setHints = (on: boolean) => {
      if (hintsOn === on) return;
      hintsOn = on;
      setHeroHintsVisible(on);
    };

    /** 비디오 seek 큐잉 */
    const flushSeek = () => {
      scrubRaf = 0;
      if (!isFinite(video.duration) || isSeeking) return;

      const next = targetTime;
      if (Math.abs(video.currentTime - next) < 1 / 30) return;

      if (!video.paused) video.pause();
      isSeeking = true;
      video.currentTime = next;
    };

    const queueSeek = (time: number) => {
      // 30fps 격자로 양자화 → 불필요한 근접 seek 감소
      const dur = video.duration || 0;
      targetTime = dur > 0 ? Math.round(time * 30) / 30 : time;
      if (!scrubRaf) scrubRaf = requestAnimationFrame(flushSeek);
    };

    const onSeeked = () => {
      isSeeking = false;
      if (playingAllRef.current) return;
      if (Math.abs(video.currentTime - targetTime) < 1 / 30) return;
      if (!scrubRaf) scrubRaf = requestAnimationFrame(flushSeek);
    };
    video.addEventListener("seeked", onSeeked);

    const setCrossfade = (t: number) => {
      sticky.style.opacity = String(1 - t);
      if (Math.abs(t - lastT.current) > 0.004 || (t === 0 && lastT.current !== 0) || t === 1) {
        lastT.current = t;
        emitCrossfade(t);
      }
    };

    /** 스크롤 progress 비주얼 적용 */
    const applyVisual = (progress: number) => {
      const p = Math.max(0, Math.min(1, progress));

      if (p >= FADE_OUT_END) {
        readyRef.current = true;
        video.style.opacity = "0";
        overlay.style.opacity = "0";
        return;
      }

      readyRef.current = false;
      overlay.style.opacity = String(Math.max(0, 1 - p / LOGO_OUT_END));

      let videoOpacity = 0;
      if (p < VIDEO_IN_START) {
        videoOpacity = 0;
      } else if (p < VIDEO_IN_END) {
        videoOpacity = (p - VIDEO_IN_START) / (VIDEO_IN_END - VIDEO_IN_START);
      } else if (p < SCRUB_END) {
        videoOpacity = 1;
      } else if (p < FADE_OUT_END) {
        videoOpacity = 1 - (p - SCRUB_END) / (FADE_OUT_END - SCRUB_END);
      }

      const scaleProgress = Math.min(1, p / SCRUB_END);
      video.style.opacity = String(videoOpacity);
      video.style.transform = `scale(${0.5 + 0.5 * scaleProgress})`;
      sticky.style.opacity = "1";
    };

    /** 수동 스크롤: progress → 영상 seek */
    const applyProgress = (progress: number) => {
      const p = Math.max(0, Math.min(1, progress));
      applyVisual(p);

      if (p >= FADE_OUT_END) return;
      if (p < VIDEO_IN_START) return;

      const scrubProgress = Math.max(
        0,
        Math.min(1, (p - VIDEO_IN_END) / (SCRUB_END - VIDEO_IN_END)),
      );
      queueSeek(scrubProgress * (video.duration || 0));
    };

    const runEnter = () => {
      if (enteringRef.current || inSlider) return;
      enteringRef.current = true;
      playingAllRef.current = false;
      setPlayingAll(false);
      setHints(false);
      video.pause();
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

    /**
     * 자동 스크롤 재생: 프레임마다 seek 하지 않고,
     * 스크럽 구간에서 video.play()로 부드럽게 재생 + 비주얼 progress 동기화
     */
    const runScrollToAbout = () => {
      if (playingAllRef.current || enteringRef.current || inSlider) return;

      if (readyRef.current) {
        runEnter();
        return;
      }

      playingAllRef.current = true;
      setPlayingAll(true);
      setHints(false);
      measureSection();

      const startProgress = Math.max(
        0,
        Math.min(FADE_OUT_END, (window.scrollY - sectionTop) / sectionRange),
      );
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dur = reduce ? 500 : SCROLL_TO_ABOUT_MS;
      const start = performance.now();
      const progressSpan = Math.max(0.001, FADE_OUT_END - startProgress);

      const html = document.documentElement;
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";

      let videoStarted = false;
      let videoEnded = false;
      let lastScrollY = -1;

      const scrubWallMs = ((SCRUB_END - VIDEO_IN_END) / progressSpan) * dur;
      const rate =
        isFinite(video.duration) && video.duration > 0
          ? Math.min(4, Math.max(0.5, video.duration / Math.max(0.4, scrubWallMs / 1000)))
          : 1;

      const finish = () => {
        html.style.scrollBehavior = prevBehavior;
        video.pause();
        video.playbackRate = 1;
        playingAllRef.current = false;
        setPlayingAll(false);
        window.scrollTo({ top: sectionTop + FADE_OUT_END * sectionRange, behavior: "auto" });
        runEnter();
      };

      const tick = (now: number) => {
        if (!playingAllRef.current) {
          html.style.scrollBehavior = prevBehavior;
          video.pause();
          video.playbackRate = 1;
          return;
        }

        const t = Math.min(1, (now - start) / dur);
        const progress = startProgress + progressSpan * t;
        applyVisual(progress);

        const y = sectionTop + progress * sectionRange;
        if (Math.abs(y - lastScrollY) > 24) {
          lastScrollY = y;
          window.scrollTo({ top: y, behavior: "auto" });
        }

        if (!videoStarted && progress >= VIDEO_IN_END) {
          videoStarted = true;
          try {
            video.pause();
            video.currentTime = Math.max(
              0,
              ((Math.max(progress, VIDEO_IN_END) - VIDEO_IN_END) / (SCRUB_END - VIDEO_IN_END)) *
                (video.duration || 0),
            );
            video.playbackRate = rate;
            void video.play().catch(() => {});
          } catch {
            /* autoplay 정책 등 */
          }
        }

        if (!videoEnded && progress >= SCRUB_END) {
          videoEnded = true;
          video.pause();
        }

        if (t < 1) {
          playAllRaf = requestAnimationFrame(tick);
          return;
        }

        finish();
      };
      playAllRaf = requestAnimationFrame(tick);
    };

    playAllFnRef.current = runScrollToAbout;

    const onWheel = (e: WheelEvent) => {
      if (playingAllRef.current) {
        e.preventDefault();
        return;
      }
      if (!readyRef.current || enteringRef.current || inSlider) return;
      if (e.deltaY <= 0) return;
      e.preventDefault();
      runEnter();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (inSlider || enteringRef.current) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (t?.closest("a, button, [role='button']")) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        if (readyRef.current) runEnter();
        else runScrollToAbout();
        return;
      }

      if ((e.key === "Enter" || e.key === " ") && readyRef.current) {
        e.preventDefault();
        runEnter();
      }
    };

    const parkHero = () => {
      sticky.style.opacity = "0";
      sticky.style.pointerEvents = "none";
      section.style.pointerEvents = "none";
      section.inert = true;
      overlay.style.pointerEvents = "none";
      video.style.pointerEvents = "none";
    };

    const onSection = (e: Event) => {
      inSlider = Boolean((e as CustomEvent).detail?.inSlider);
      if (inSlider) {
        playingAllRef.current = false;
        setPlayingAll(false);
        setHints(false);
        parkHero();
      } else {
        setHints(true);
        sticky.style.pointerEvents = "";
        section.style.pointerEvents = "";
        section.inert = false;
        overlay.style.pointerEvents = "";
        video.style.pointerEvents = "";
      }
    };

    const onScroll = () => {
      if (enteringRef.current || playingAllRef.current || inSlider) return;

      const progress = Math.max(0, Math.min(1, (window.scrollY - sectionTop) / sectionRange));

      setHints(progress <= 0.02 && !inSlider);

      if (progress >= FADE_OUT_END) {
        const snapY = sectionTop + FADE_OUT_END * sectionRange;
        if (!readyRef.current) {
          readyRef.current = true;
          window.scrollTo({ top: snapY, behavior: "auto" });
        } else if (Math.abs(window.scrollY - snapY) > 2) {
          window.scrollTo({ top: snapY, behavior: "auto" });
        }
        video.style.opacity = "0";
        overlay.style.opacity = "0";
        setCrossfade(0);
        return;
      }

      applyProgress(progress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("section-change", onSection);
    window.addEventListener("resize", measureSection);
    return () => {
      playAllFnRef.current = null;
      playingAllRef.current = false;
      video.pause();
      video.playbackRate = 1;
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("section-change", onSection);
      window.removeEventListener("resize", measureSection);
      if (enterRaf) cancelAnimationFrame(enterRaf);
      if (playAllRaf) cancelAnimationFrame(playAllRaf);
      if (scrubRaf) cancelAnimationFrame(scrubRaf);
    };
  }, [mode, videoReady]);

  const handlePlayAll = () => {
    playAllFnRef.current?.();
  };

  // 폰/태블릿 스크롤 차단
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

  // 폰 슬라이드 잠금 해제
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

    const onKeyDown = (e: KeyboardEvent) => {
      if (touchEnteringRef.current) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finishEnter(0);
      }
    };

    thumb.addEventListener("pointerdown", onPointerDown);
    thumb.addEventListener("pointermove", onPointerMove);
    thumb.addEventListener("pointerup", onPointerUp);
    thumb.addEventListener("pointercancel", onPointerUp);
    thumb.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", measure);
    return () => {
      thumb.removeEventListener("pointerdown", onPointerDown);
      thumb.removeEventListener("pointermove", onPointerMove);
      thumb.removeEventListener("pointerup", onPointerUp);
      thumb.removeEventListener("pointercancel", onPointerUp);
      thumb.removeEventListener("keydown", onKeyDown);
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
        data-nosnippet
        className="relative z-20 flex h-[100dvh] flex-col items-center justify-center overflow-hidden bg-bg will-change-[opacity]"
        style={{ touchAction: "none" }}
      >
        <Image src="/logo.png" alt="logo" width={220} height={220} className="site-logo object-contain" priority />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <div
            ref={unlockTrackRef}
            className="unlock-track relative mx-auto flex h-14 w-full max-w-sm items-center overflow-hidden rounded-full px-1"
            aria-label="Slide to enter"
          >
            <span
              ref={unlockLabelRef}
              className="pointer-events-none absolute inset-0 flex items-center justify-center pl-10 text-[13px] tracking-[0.14em] text-ink/50"
            >
              Slide to enter
            </span>
            <button
              ref={unlockThumbRef}
              type="button"
              aria-label="Enter 키로 About 섹션 입장"
              className="unlock-thumb relative z-[1] flex h-12 w-12 shrink-0 touch-none items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
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
        data-nosnippet
        className="relative z-20 h-[100dvh] overflow-hidden bg-bg will-change-[opacity]"
      >
        <button
          type="button"
          onClick={goAboutByTap}
          aria-label="탭해서 About으로 이동"
          className="flex h-full w-full flex-col items-center justify-center"
        >
          <Image src="/logo.png" alt="logo" width={260} height={260} className="site-logo object-contain" priority />

          <div className="absolute bottom-16 flex flex-col items-center gap-2 text-ink/40">
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
    <section ref={sectionRef} data-nosnippet className="relative z-20 h-[850vh]">
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden bg-bg will-change-[opacity]">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0, transform: "scale(0.5)", transformOrigin: "center center" }}
          src={videoSrc ?? undefined}
          muted
          playsInline
          preload="auto"
        />

        {mode === "desktop" && !videoReady && (
          <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            data-hero-loader
            className="fixed inset-0 z-[400] bg-bg max-lg:hidden"
          >
            <div className="flex h-full items-center justify-center">
              <Image src="/logo.png" alt="" width={280} height={280} className="site-logo object-contain" priority />
            </div>
            <div className="absolute inset-x-0 bottom-16 flex flex-col items-center gap-4 px-6">
              <div className="hero-pour" aria-hidden>
                {Array.from({ length: 8 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      ["--base" as string]: `${(i - 3.5) * 5}deg`,
                      ["--i" as string]: i,
                    }}
                  />
                ))}
              </div>
              <p className="text-base text-ink/70">페이지를 불러오는 중</p>
            </div>
          </div>
        )}

        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center"
          style={{ transition: "opacity 0.4s ease" }}
        >
          <div ref={logoRef} style={{ transition: "transform 200ms ease-out", transformStyle: "preserve-3d" }}>
            <Image src="/logo.png" alt="logo" width={280} height={280} className="site-logo object-contain" priority />
          </div>

          <div
            className="absolute bottom-10 flex flex-col items-center gap-3 transition-opacity duration-300"
            style={{ opacity: heroHintsVisible && !playingAll ? 1 : 0, pointerEvents: heroHintsVisible && !playingAll ? "auto" : "none" }}
          >
            <button
              type="button"
              onClick={handlePlayAll}
              disabled={playingAll}
              aria-label="Enter — 히어로 연출 후 About으로 이동"
              className="glass-ios inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-wide text-ink/80 transition-all duration-200 hover:scale-[1.06] hover:border-ink/30 hover:text-ink active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
              Enter
            </button>
            <p className="text-[11px] tracking-[0.14em] text-ink/35">
              휠이나 <kbd className="rounded px-1 text-ink/45">↓</kbd> 키로도 이동해요
            </p>
            <span className="sr-only">
              스크롤하거나 아래 방향키, 또는 Enter 버튼으로 영상을 넘기며 About으로 이동할 수 있어요.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

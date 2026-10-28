"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * 데스크톱 스크롤 규칙
 * - 지구본·여권처럼 스크롤로 움직이는 구간은 그 안에서 자유롭게 스크롤해요.
 * - 그 구간 끝(또는 일반 섹션)에서 휠을 한 번 굴리면 다음 섹션으로 한 번에 넘어가요.
 */
export default function Pager() {
  useEffect(() => {
    if (!matchMedia("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;

    let down: number[] = [];
    let up: number[] = [];
    let ranges: { start: number; end: number }[] = [];
    let hero: ScrollTrigger | undefined;
    // 올림: 배율이 125%·150%인 QHD 화면에서 내림되면 이전 섹션이 한 줄 비쳐요
    const top = (sel: string) => Math.ceil(document.querySelector(sel)!.getBoundingClientRect().top + scrollY);

    const build = () => {
      hero = ScrollTrigger.getById("hero");
      const pp = ScrollTrigger.getById("passport");
      // 지구본 구간은 구름이 시작되는 데까지만 직접 스크롤하고, 거기서부터는 다음 섹션까지 한 번에 넘어가요
      const tl = hero?.animation as gsap.core.Timeline | undefined;
      const clouds = hero && tl ? Math.round(hero.start + (hero.end - hero.start) * (tl.labels.clouds ?? tl.duration()) / tl.duration()) : 0;
      ranges = [...(hero ? [{ start: Math.round(hero.start), end: clouds }] : []), ...(pp ? [{ start: Math.round(pp.start), end: Math.round(pp.end) }] : [])];
      const sections = [pp ? pp.start : top("#about"), ...(pp ? [pp.end] : []), top("#skills"), top("#flights"), top("#contact")];
      const max = ScrollTrigger.maxScroll(window);
      const clean = (l: number[]) => [...new Set(l.map((y) => Math.min(Math.max(Math.ceil(y), 0), max)))].sort((a, b) => a - b);
      // 내려갈 땐 구름 시작점에서 곧장 여권으로, 올라갈 땐 구름 시작점(대구 카드가 보이는 곳)으로 돌아가요
      down = clean([0, ...sections]);
      up = clean([0, ...(hero ? [clouds] : []), ...sections]);
    };

    let busy = false;
    let quietUntil = 0;
    const goTo = (target: number) => {
      const dist = Math.abs(target - scrollY) / innerHeight;
      busy = true;
      gsap.to(window, {
        scrollTo: { y: target, autoKill: false },
        duration: Math.min(1.4, Math.max(0.8, dist * 0.7)),
        ease: "power2.inOut",
        // 스크럽이 1초 늦게 따라와서, 지구본 고정이 풀린 뒤에도 구름이 덜 덮인 채 밀려 올라가지 않게 끝까지 채워요
        onUpdate: () => { if (hero && scrollY >= hero.end) hero.getTween()?.progress(1); },
        onComplete: () => {
          busy = false;
          quietUntil = performance.now() + 300;
        },
      });
    };
    const jump = (dir: number) => {
      const y = scrollY;
      const target = dir > 0 ? down.find((s) => s > y + 2) : [...up].reverse().find((s) => s < y - 2);
      if (target !== undefined) goTo(target);
    };
    // 그 방향으로 아직 진행할 여지가 있는 연출 구간
    const rangeAt = (y: number, dir: number) =>
      ranges.find((r) => (dir > 0 ? y >= r.start - 1 && y < r.end - 1 : y > r.start + 1 && y <= r.end + 1));
    const locked = () => document.documentElement.style.overflow === "hidden"; // 탑승권·기획서가 열려 있음

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || locked()) return;
      const t = performance.now();
      const y = scrollY;
      const dir = Math.sign(e.deltaY);
      if (!dir) return;

      e.preventDefault();

      // 스크롤 연출 구간 안: 스크롤을 직접 움직여서 구간 끝을 한 픽셀도 넘지 않게 해요.
      // (브라우저 기본 부드러운 스크롤에 맡기면 끝을 살짝 지나쳐 다음 섹션이 비쳐요)
      const r = rangeAt(y, dir);
      if (r && !busy) {
        const px = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
        const next = Math.min(r.end, Math.max(r.start, y + px));
        scrollTo(0, next);
        if (next === r.end || next === r.start) quietUntil = t + 250;
        return;
      }

      // 트랙패드 관성이 멈출 때까지는 다음 이동을 받지 않아요
      if (busy || t < quietUntil) {
        quietUntil = Math.max(quietUntil, t + 160);
        return;
      }
      if (Math.abs(e.deltaY) < 4) return;
      jump(dir);
    };
    const onKey = (e: KeyboardEvent) => {
      if (locked() || (e.target as HTMLElement).closest("input, textarea")) return;
      const dir = ["PageDown", "ArrowDown", " "].includes(e.key) ? 1 : ["PageUp", "ArrowUp"].includes(e.key) ? -1 : 0;
      if (!dir) return;
      const y = scrollY;
      e.preventDefault();
      const d = e.shiftKey && e.key === " " ? -1 : dir;
      const r = rangeAt(y, d);
      if (r) scrollTo(0, Math.min(r.end, Math.max(r.start, y + d * innerHeight * 0.25)));
      else if (!busy) jump(d);
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || locked()) return;
      e.preventDefault();
      const id = a.getAttribute("href")!;
      if (!busy) goTo(id === "#top" ? 0 : top(id));
    };

    build();
    ScrollTrigger.addEventListener("refresh", build);
    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      ScrollTrigger.removeEventListener("refresh", build);
      removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}

"use client";

import { useEffect, useRef } from "react";

const BLOB_CLASS = ["bg-blob-1", "bg-blob-2", "bg-blob-3"] as const;

type Mover = {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tvx: number;
  tvy: number;
  w: number;
  h: number;
  nextTurn: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const kick = (mover: Mover) => {
  const angle = Math.random() * Math.PI * 2;
  const speed = rand(8, 16);
  mover.tvx = Math.cos(angle) * speed;
  mover.tvy = Math.sin(angle) * speed;
  mover.nextTurn = performance.now() + rand(18000, 36000);
};

export default function PearlBg() {
  const blobRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const movers: Mover[] = [];
    blobRefs.current.forEach((el) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.top = "0px";
      el.style.right = "auto";
      el.style.bottom = "auto";
      el.style.left = "0px";
      el.style.willChange = "transform";
      const mover: Mover = {
        el,
        x: rect.left,
        y: rect.top,
        vx: 0,
        vy: 0,
        tvx: 0,
        tvy: 0,
        w: rect.width,
        h: rect.height,
        nextTurn: 0,
      };
      kick(mover);
      mover.el.style.transform = `translate3d(${mover.x}px, ${mover.y}px, 0)`;
      movers.push(mover);
    });

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!document.hidden) {
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;

        for (const mover of movers) {
          if (now >= mover.nextTurn) kick(mover);

          const ease = 1 - Math.exp(-0.25 * dt);
          mover.vx += (mover.tvx - mover.vx) * ease;
          mover.vy += (mover.tvy - mover.vy) * ease;

          mover.x += mover.vx * dt;
          mover.y += mover.vy * dt;

          const minX = -mover.w * 0.62;
          const maxX = viewWidth - mover.w * 0.38;
          const minY = -mover.h * 0.62;
          const maxY = viewHeight - mover.h * 0.38;

          if (mover.x < minX) {
            mover.x = minX;
            mover.vx = Math.abs(mover.vx);
            mover.tvx = Math.abs(mover.tvx);
          } else if (mover.x > maxX) {
            mover.x = maxX;
            mover.vx = -Math.abs(mover.vx);
            mover.tvx = -Math.abs(mover.tvx);
          }

          if (mover.y < minY) {
            mover.y = minY;
            mover.vy = Math.abs(mover.vy);
            mover.tvy = Math.abs(mover.tvy);
          } else if (mover.y > maxY) {
            mover.y = maxY;
            mover.vy = -Math.abs(mover.vy);
            mover.tvy = -Math.abs(mover.tvy);
          }

          mover.el.style.transform = `translate3d(${mover.x}px, ${mover.y}px, 0)`;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const handleResize = () => {
      for (const mover of movers) {
        mover.w = mover.el.offsetWidth;
        mover.h = mover.el.offsetHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      for (const mover of movers) {
        mover.el.style.transform = "";
        mover.el.style.top = "";
        mover.el.style.right = "";
        mover.el.style.bottom = "";
        mover.el.style.left = "";
        mover.el.style.willChange = "";
      }
    };
  }, []);

  return (
    <>
      {BLOB_CLASS.map((name, index) => (
        <div
          key={name}
          ref={(node) => {
            blobRefs.current[index] = node;
          }}
          aria-hidden
          className={`bg-blob ${name}`}
        />
      ))}
      <div aria-hidden className="pearl-bg pointer-events-none fixed inset-0 z-[25]" />
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { WX_URL, look, parse, wxIcon, wxName, type Look, type Now } from "@/lib/weather";
import SplitFlap from "@/components/SplitFlap";
import Globe from "@/components/Globe";
import { gsap, useGSAP } from "@/lib/gsap";

export function Plane({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const zoom = useRef(0);
  const label = useRef<HTMLDivElement>(null);
  const sky = useRef<Look>(null);
  const [now, setNow] = useState<Now | null>(null);

  // 대구 현재 날씨: 실패하면 날씨 줄만 빠지고 구름은 기본 하늘이에요
  useEffect(() => {
    fetch(WX_URL).then((r) => r.json()).then(parse).then((n) => {
      if (!n) return;
      sky.current = look(n);
      setNow(n);
    }).catch(() => {});
  }, []);

  useGSAP(() => {
    gsap.from("[data-in]", { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, delay: 0.5 });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const z = { v: 0 };
      const tl = gsap.timeline({
        scrollTrigger: { id: "hero", trigger: root.current, start: "top top", end: "+=400%", pin: true, scrub: 1 },
      });
      tl.to(z, { v: 1, duration: 1, ease: "none", onUpdate: () => { zoom.current = z.v; } }, 0)
        .to("[data-intro]", { opacity: 0, y: -40, duration: 0.14, ease: "none" }, 0.02)
        // 성층권: 우주의 검정이 옅은 파랑으로 바뀌어요
        .to("[data-space]", { opacity: 0, duration: 0.2, ease: "none" }, 0.35)
        .fromTo("[data-haze]", { opacity: 0 }, { opacity: 0.75, duration: 0.2, ease: "power1.in" }, 0.5)
        .to("[data-haze]", { opacity: 0.15, duration: 0.15 }, 0.82);
      // 대구 카드가 천천히 떠오르고, 잠깐 머문 뒤 카메라가 대구 위 구름층 속으로 더 내려가 하얗게 덮이며 다음 섹션으로 넘어가요
      tl.fromTo("[data-arrive]", { opacity: 0, y: 28, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power3.out" }, 0.84)
        .addLabel("clouds", 1.12) // 여기서부터는 Pager가 다음 섹션까지 한 번에 넘겨요
        .to(z, { v: 2, duration: 0.45, ease: "none", onUpdate: () => { zoom.current = z.v; } }, "clouds")
        .to("[data-arrive]", { opacity: 0, y: -24, duration: 0.1, ease: "power1.in" }, 1.14)
        .to({}, { duration: 0.05 }); // 하얗게 덮인 채 잠깐 머물러요
    });
  }, { scope: root });

  return (
    <section id="top" ref={root} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#04050a] text-white">
      {/* 성운: 별 뒤로 아주 옅게 번지는 빛 */}
      <div data-space className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_18%_22%,rgba(88,70,160,.22),transparent_70%),radial-gradient(ellipse_55%_50%_at_85%_78%,rgba(40,95,160,.2),transparent_70%),radial-gradient(ellipse_40%_30%_at_70%_15%,rgba(150,70,110,.12),transparent_70%)]" />
        <div className="absolute -inset-x-1/4 top-1/2 h-[38%] -translate-y-1/2 -rotate-[24deg] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(190,200,255,.07),transparent_70%)] blur-2xl" />
      </div>
      <Globe zoom={zoom} label={label} sky={sky} className="absolute inset-0" />

      <div data-haze className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0e1a2c_0%,#24476f_45%,#6f9cc8_100%)] opacity-0 mix-blend-screen" />

      <div ref={label} className="pointer-events-none absolute left-0 top-0" aria-hidden>
        {/* 작은 화면에선 카드가 핀 바로 아래 가운데로 와요 */}
        <div data-arrive className="absolute left-7 top-7 w-max origin-top-left opacity-0 max-sm:left-0 max-sm:top-8 max-sm:-translate-x-1/2 max-sm:origin-top">
          <div className="h-px w-16 origin-left -translate-x-6 -translate-y-1 rotate-[35deg] bg-white/70 max-sm:hidden" />
          <div className="relative mt-5 w-[276px] overflow-hidden rounded-[26px] bg-[linear-gradient(150deg,#4b93ff_0%,#3182f6_45%,#1b4fc4_100%)] p-[22px] text-white shadow-[0_24px_60px_-12px_rgba(10,30,90,.65)] ring-1 ring-white/20 max-sm:w-[252px]">
            {/* 한자 이름을 큰 워터마크로 */}
            <span aria-hidden className="pointer-events-none absolute -bottom-9 -right-3 text-[138px] font-black leading-none text-white/[.09]">大邱</span>
            <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.18em] text-white/75">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7dffb0] shadow-[0_0_8px_#7dffb0]" />DESTINATION · TAE
            </p>
            <p className="mt-3 text-[44px] font-bold leading-none tracking-[-0.03em]">대구</p>
            <p className="mt-2 text-[16px] font-medium text-white/80">Daegu <span className="ml-1 text-white/60">大邱</span></p>
            {now && (
              <div className="relative mt-6 flex items-end justify-between">
                <div>
                  <p className="text-[58px] font-semibold leading-[0.85] tracking-[-0.04em] tabular-nums">{Math.round(now.temp)}°</p>
                  <p className="mt-2 text-[15px] font-semibold">{wxName(now.code)} <span className="font-medium text-white/60">· 지금</span></p>
                </div>
                {/* 날씨 아이콘: Iconify Phosphor Light (MIT) */}
                <img src={wxIcon(now.code)} alt="" className="float h-[64px] w-[64px] opacity-90" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div data-intro className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-center px-5 pt-[var(--bar)] sm:px-8">
        <h1>
          <SplitFlap text="장경진" className="text-[clamp(60px,9vw,128px)] font-semibold" delay={300} />
        </h1>
        <p data-in className="mt-5 text-[clamp(20px,2vw,26px)] font-medium">프론트엔드 개발자</p>
        <p data-in className="mt-2 max-w-md text-[16px] leading-7 text-white/60">많은 사용자들에게 편리함을 제공하고 싶어요.</p>
      </div>

    </section>
  );
}

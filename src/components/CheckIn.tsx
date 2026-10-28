"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { INSTAGRAM_URL } from "@/data/photos";
import { gsap, useGSAP } from "@/lib/gsap";
import { sandText } from "@/lib/sand";

const EMAIL = "nova021206@kakao.com";
const SOCIALS = [
  { label: "GitHub", handle: "github.com/d3vkj", href: "https://github.com/d3vkj" },
  { label: "Instagram", handle: "@jinsnation", href: INSTAGRAM_URL },
];

/** 마지막 섹션: 안개 낀 활주로에 비행기가 내려앉아요. */
export default function CheckIn() {
  const root = useRef<HTMLElement>(null);
  const sand = useRef<HTMLCanvasElement>(null);
  const head = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(() => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 55%" } });
    const mm = gsap.matchMedia();
    // 명언이 가운데에 서서히 떠올랐다가 모래가 되어 날아가고,
    // 가운데에 "같이 만들어가요"가 나타나 왼쪽 제자리로 옮겨 가요
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cv = sand.current!, h = head.current!, sec = root.current!;
      let quote: ReturnType<typeof sandText>;
      const toCenter = (axis: "x" | "y") => {
        const r = h.getBoundingClientRect(), s = sec.getBoundingClientRect();
        return axis === "x" ? s.left + s.width / 2 - (r.left + r.width / 2) : s.top + s.height / 2 - (r.top + r.height / 2);
      };
      gsap.set(h, { opacity: 0 });
      // 캔버스는 글꼴이 받아진 뒤에 그려야 해서, 잠깐 멈추고 나눔명조를 받아요
      tl.call(() => {
        tl.pause();
        const size = Math.max(30, Math.min(cv.clientWidth * 0.06, 84));
        Promise.all([document.fonts.load(`700 ${size}px 'Nanum Myeongjo'`), document.fonts.load("400 17px 'Nanum Myeongjo'")]).catch(() => {}).then(() => {
          quote = sandText(cv, [
            { text: "“시련은 있어도", size, weight: 700, alpha: 1 },
            { text: "실패는 없다.”", size, weight: 700, alpha: 1 },
            { text: "— 故 정주영 회장", size: 17, weight: 400, alpha: 0.65, gap: size * 0.55 },
          ], "'Nanum Myeongjo', serif");
          tl.resume();
        });
      })
        .fromTo(cv, { opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)", duration: 2, ease: "power2.out" })
        .call(() => quote.blow(), undefined, "+=1.6")
        .fromTo(h, { opacity: 0, x: () => toCenter("x"), y: () => toCenter("y"), filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 1, ease: "power2.out" }, "+=1.5")
        .to(h, { x: 0, y: 0, duration: 1.2, ease: "power3.inOut" }, "+=0.5");
      gsap.fromTo("[data-photo]", { scale: 1.12 }, { scale: 1, duration: 14, ease: "power1.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
    });
    tl.from("[data-fade]", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.3")
      .from("[data-rule]", { scaleX: 0, transformOrigin: "0 50%", duration: 0.8, ease: "power3.inOut", stagger: 0.08 }, "-=0.5")
      .from("[data-item]", { y: 16, opacity: 0, duration: 0.5, ease: "power3.out", stagger: 0.08 }, "-=0.6");
  }, { scope: root });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section id="contact" ref={root} className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#0c0d10] text-white lg:h-[100svh]">
      {/* 사진: Amsterdam City Archives, Unsplash License */}
      <Image data-photo src="/landing.jpg" alt="" fill sizes="100vw" className="object-cover" />
      {/* 사진을 어둡게 눌러 글자가 또렷해요 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,10,.86)_0%,rgba(6,7,10,.62)_55%,rgba(6,7,10,.75)_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#060709]/90 to-transparent" />
      {/* 명언: 캔버스에 그렸다가 모래로 흩어져요 */}
      <canvas ref={sand} aria-hidden className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-0" />
      <p className="sr-only">시련은 있어도 실패는 없다. 故 정주영 회장</p>

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-5 pt-[calc(var(--bar)+48px)] sm:px-8 lg:pb-[14svh] lg:pt-[var(--bar)]">
        <div className="grid flex-1 content-center gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            {/* 한 줄. w-fit이라 가운데로 옮길 때 글자 폭 기준으로 맞아요 */}
            <h3 ref={head} className="w-fit whitespace-nowrap text-[clamp(34px,5vw,84px)] font-bold leading-[1.1] tracking-[-0.04em]">같이 만들어가요</h3>
            <p data-fade className="mt-8 max-w-md text-[17px] leading-8 text-white/75">
              많은 사용자들에게 편리함을 제공하고 싶어요.<br />함께 만들고 성장할 기회를 기다려요.
            </p>
          </div>

          <dl className="relative">
            <span data-rule className="absolute inset-x-0 top-0 h-[2px] bg-white/80" />
            <div data-item className="flex flex-col gap-2 border-b border-white/20 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:py-6">
              <dt className="text-sm text-white/60 sm:w-24">이메일</dt>
              <dd className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                <a href={`mailto:${EMAIL}`} className="break-all text-[clamp(19px,1.9vw,26px)] font-semibold transition-opacity hover:opacity-80">{EMAIL}</a>
                <button type="button" onClick={copy} className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/25">
                  {copied ? "복사했어요" : "복사"}
                </button>
              </dd>
            </div>
            {SOCIALS.map((s) => (
              <div key={s.label} data-item className="flex flex-col gap-2 border-b border-white/20 py-5 sm:flex-row sm:items-center sm:gap-6 sm:py-6">
                <dt className="text-sm text-white/60 sm:w-24">{s.label}</dt>
                <dd>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-[clamp(19px,1.9vw,26px)] font-semibold transition-opacity hover:opacity-80">
                    {s.handle} ↗
                  </a>
                </dd>
              </div>
            ))}
            <span data-rule className="absolute inset-x-0 bottom-0 h-[2px] bg-white/40" />
          </dl>
        </div>

        <footer className="mt-20 flex flex-col justify-between gap-4 border-t border-white/20 py-8 text-xs leading-5 text-white/60 sm:flex-row sm:items-end lg:absolute lg:inset-x-8 lg:bottom-0 lg:mt-0">
          <p>© 2026 Jang Kyungjin · 배경 사진 Amsterdam City Archives / Unsplash<br />이 프로젝트는 개인 포트폴리오를 위해 공개했어요.<br />코드를 무단으로 사용하지 말아주세요.</p>
          <a href="#top" className="font-medium text-white transition-opacity hover:opacity-80">맨 위로 ↑</a>
        </footer>
      </div>
    </section>
  );
}

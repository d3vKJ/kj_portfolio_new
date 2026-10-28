"use client";

import Sky from "@/components/Sky";
import { useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { PHOTOS, INSTAGRAM_URL } from "@/data/photos";
import { gsap, useGSAP } from "@/lib/gsap";

// 사진 더미는 흩어 놓는 값이 서버와 브라우저에서 달라 하이드레이션 오류가 나서, 브라우저에서만 그려요
const Stack = dynamic(() => import("@/components/bits/Stack"), { ssr: false });

const EMAIL = "nova021206@kakao.com";

function Field({ k, v, className = "" }: { k: string; v: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-[10.5px] leading-tight text-paper-ink/55">{k}</dt>
      <dd className="mt-0.5 text-[15px] font-semibold leading-snug [overflow-wrap:anywhere]">{v}</dd>
    </div>
  );
}

function DataPage() {
  return (
    <div className="@container flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-baseline justify-between border-b border-paper-ink/15 pb-2 text-[11.5px] font-medium text-paper-ink/65">
        <span>여권 PASSPORT</span>
        <span>REPUBLIC OF KOREA</span>
      </div>
      <div className="mt-4 flex items-start gap-5">
        <div className="relative aspect-[3/4] w-[41%] shrink-0 overflow-hidden rounded-[3px] bg-paper-ink/10 shadow-[inset_0_0_0_1px_rgba(25,31,40,.08)]">
          <Image src="/profile.jpg" alt="장경진 프로필 사진" fill sizes="200px" className="object-cover" />
        </div>
        <dl className="grid min-w-0 flex-1 grid-cols-[1fr_1.3fr] content-start gap-x-3 gap-y-3">
          <Field k="종류 / Type" v="PM" />
          <Field k="발행국 / Country" v="KOR" />
          <Field k="성 / Surname" v="JANG" className="col-span-2" />
          <Field k="이름 / Given names" v="KYUNGJIN" className="col-span-2" />
          <Field k="한글성명" v="장경진" />
          <Field k="생년월일 / Birth" v={<span className="whitespace-nowrap">06 DEC 2002</span>} />
          <Field k="거주지 / Location" v="대한민국 대구광역시" className="col-span-2" />
        </dl>
      </div>
      <dl className="mt-5 space-y-2 border-t border-paper-ink/15 pt-4">
        <Field k="이메일 / Email" v={<a href={`mailto:${EMAIL}`} className="underline-offset-2 hover:underline">{EMAIL}</a>} />
        <div className="grid grid-cols-2 gap-3">
          <Field k="GitHub" v={<a href="https://github.com/d3vkj" target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">github.com/d3vkj</a>} />
          <Field k="Instagram" v={<a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">@jinsnation</a>} />
        </div>
      </dl>
      {/* 소지인 서명: 이름 대신 좌우명을 회색 펜으로 직접 적은 것처럼 */}
      <div className="mt-4 border-t border-paper-ink/15 pt-3">
        <p className="text-[10.5px] leading-tight text-paper-ink/55">소지인 서명 / Signature</p>
        {/* 두 줄로 나눠 아랫줄은 살짝 오른쪽에서 이어 써요 */}
        <p className="motto mt-1.5 text-[clamp(22px,calc(100cqw/10),32px)]">
          <span data-sign className="block">도전은 무료니까,</span>
          <span data-sign className="ml-[1.6em] block">도전만큼은 사치 부리자</span>
        </p>
      </div>
      {/* 두 줄이 어떤 폭에서도 줄바꿈 없이 들어가게 페이지 폭에 맞춰 글자 크기를 정해요 */}
      <p className="mrz mt-auto pt-4 text-[clamp(7px,calc(100cqw/32),12.5px)] text-paper-ink/75" aria-hidden>
        P&lt;KORJANG&lt;&lt;KYUNGJIN&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
        KJ1206&lt;&lt;4KOR0212068&lt;FRONTEND&lt;DEV&lt;&lt;02
      </p>
    </div>
  );
}

/**
 * 도장 하나. 바깥(data-stamp)은 GSAP이 찍히는 연출을, 안쪽(.stamp)은 기울기와 호버 확대를 맡아요.
 * 둘을 한 요소에 두면 CSS 트랜지션과 GSAP이 같은 값을 다퉈서 도장이 안 보이게 돼요.
 */
function Stamp({ pos, color, rotate, origin, zoom, className, style, children }: {
  pos: string; color: string; rotate: string; origin: string; zoom?: string; className: string; style?: React.CSSProperties; children: React.ReactNode;
}) {
  return (
    <div data-stamp className={`absolute ${pos}`}>
      <div className={`stamp ${className}`} style={{ ["--ink-c" as string]: color, ["--r" as string]: rotate, ["--zoom" as string]: zoom, transformOrigin: origin, ...style }}>
        {children}
      </div>
    </div>
  );
}

function Stamps({ uid }: { uid: string }) {
  const id = `ring-${uid}`;
  return (
    <div className="relative h-full p-5 sm:p-6">
      <p className="border-b border-paper-ink/15 pb-2 text-[11.5px] font-medium text-paper-ink/65">사증 VISAS · <span className="[@media(hover:none)]:hidden">마우스를 올리면</span><span className="hidden [@media(hover:none)]:inline">눌러 보면</span> 크게 보여요</p>
      <div className="relative mt-2 h-[calc(100%-2rem)] min-h-[420px]">
        {/* 둥근 고무도장: 테두리를 따라 글자가 돌아가요 */}
        <Stamp pos="left-[4%] top-[3%]" color="#b8342a" rotate="-12deg" origin="top left" className="relative grid h-[148px] w-[148px] place-items-center rounded-full">
          <svg viewBox="0 0 148 148" className="absolute inset-0" aria-hidden>
            <path id={id} d="M74,74 m-56,0 a56,56 0 1,1 112,0 a56,56 0 1,1 -112,0" fill="none" />
            <circle cx="74" cy="74" r="45" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <text fill="currentColor" fontSize="11.5" fontWeight="700" letterSpacing="2" fontFamily="Pretendard, sans-serif">
              <textPath href={`#${id}`}>CHEESE COMPANY ★ GAME SERVER ★ SINCE 2025 ★</textPath>
            </text>
          </svg>
          <div className="relative text-center leading-tight">
            <span className="block text-[26px] font-bold">2025 ~</span>
            <span className="block text-[12.5px] font-bold">치즈컴퍼니</span>
            <span className="block text-[10.5px]">멀티플레이 플랫폼<br />게임 서버 개발</span>
          </div>
        </Stamp>

        <Stamp pos="right-[2%] top-[34%] w-[62%]" color="#1f4b96" rotate="5deg" origin="right center" zoom="1.3" className="rounded-sm p-3">
          <p className="flex justify-between text-[11px] font-bold"><span>수료 COMPLETED</span><span>2026</span></p>
          <p className="mt-1 text-[15px] font-bold leading-snug">SBS 아카데미AIX학원 대구</p>
          <p className="mt-1 text-[12px] leading-snug">Chat GPT와 React를 활용한 스마트 UIUX 반응형 웹디자인 과정 수료</p>
        </Stamp>

        <Stamp pos="bottom-[18%] left-[4%]" color="#1e7348" rotate="-6deg" origin="bottom left" className="rounded-[50%] px-5 py-3 text-center">
          <p className="text-[10.5px] font-bold">자격 · 2020</p>
          <p className="text-[16px] font-bold">전기기능사</p>
        </Stamp>
        <Stamp pos="bottom-[3%] right-[6%]" color="#5f3a91" rotate="9deg" origin="bottom right" className="rounded-sm px-3 py-2 text-center" style={{ borderStyle: "double", borderWidth: 4 }}>
          <p className="text-[10.5px] font-bold">면허 · 2020</p>
          <p className="text-[15px] font-bold">운전면허 1종 보통</p>
        </Stamp>
      </div>
    </div>
  );
}

/** 여권 표지 왼쪽 아래의 소용돌이 점무늬(엠보싱) */
function Swirl() {
  const dots: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < 300; i++) {
    const a = i * 0.32;
    const rad = 4 + i * 0.62;
    // 서버와 브라우저의 삼각함수 끝자리가 달라 반올림해요
    const q = (n: number) => Math.round(n * 100) / 100;
    dots.push({ x: q(120 + Math.cos(a) * rad), y: q(120 + Math.sin(a) * rad), r: q(0.9 + i * 0.004) });
  }
  return (
    <svg viewBox="0 0 240 240" className="absolute -bottom-[14%] -left-[22%] w-[95%]" aria-hidden>
      {dots.map((d, i) => <circle key={i} cx={(d.x * 100 + 60) / 100} cy={(d.y * 100 + 80) / 100} r={d.r} fill="rgba(0,0,30,.35)" />)}
      {dots.map((d, i) => <circle key={`h${i}`} cx={d.x} cy={d.y} r={d.r} fill="rgba(150,175,255,.22)" />)}
    </svg>
  );
}

function Cover() {
  return (
    <div className="face pp-cover absolute inset-0 overflow-hidden rounded-r-lg shadow-[0_24px_50px_-24px_rgba(0,0,0,.55)]">
      <Swirl />
      {/* 엠블럼 자리: 로고를 둥근 인장처럼 */}
      <div className="absolute right-[13%] top-[9%] grid aspect-square w-[30%] place-items-center rounded-full border-[1.5px] border-current">
        <div className="absolute inset-[6%] rounded-full border border-current opacity-60" />
        <Image src="/logo.png" alt="" width={2172} height={724} className="w-[74%] opacity-90" />
      </div>
      <div className="absolute right-[13%] top-[44%] text-right">
        <p className="text-[clamp(18px,2vw,28px)] font-semibold tracking-[0.04em]">대한민국 여권</p>
        <p className="mt-3 text-[clamp(11px,1.05vw,15px)] font-medium leading-snug tracking-[0.03em]">REPUBLIC OF KOREA<br />PASSPORT</p>
      </div>
      {/* 전자여권 칩 표시 */}
      <svg viewBox="0 0 36 22" className="absolute bottom-[6%] right-[13%] w-[11%]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <rect x="1" y="1" width="34" height="20" rx="1" />
        <path d="M1 11h10M25 11h10" />
        <circle cx="18" cy="11" r="6" />
      </svg>
    </div>
  );
}

export default function Passport() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({
        scrollTrigger: { id: "passport", trigger: root.current, start: "top top", end: "+=150%", pin: true, scrub: 0.5 },
      })
        .fromTo("[data-book]", { xPercent: -25, rotateX: 16, rotateZ: -4 }, { xPercent: 0, rotateX: 0, rotateZ: 0, ease: "power2.inOut", duration: 1 }, 0)
        .fromTo("[data-cover]", { rotateY: 0, z: 2 }, { rotateY: -180, z: 2, ease: "power2.inOut", duration: 1 }, 0)
        .from("[data-book] [data-stamp]", { scale: 2.4, opacity: 0, duration: 0.25, stagger: 0.18, ease: "back.out(2.5)" }, 0.9)
        // 서명은 윗줄부터 한 줄씩, 왼쪽부터 펜으로 써 내려가듯 나타나요
        .fromTo("[data-book] [data-sign]", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.3, ease: "power1.inOut", stagger: 0.3 }, 1.0)
        .to({}, { duration: 0.3 }); // 다 펼친 뒤 잠깐 머물러요
    });
    // 동작 줄이기: 펼치는 연출 없이 처음부터 펼친 여권을 보여 줘요
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: reduce)", () => {
      gsap.set("[data-cover]", { rotateY: -180, z: 2 });
    });
    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-mobile-pages] [data-stamp]", {
        scale: 2.2, opacity: 0, duration: 0.45, stagger: 0.15, ease: "back.out(2.5)",
        scrollTrigger: { trigger: "[data-mobile-pages] [data-stamp]", start: "top 85%" },
      });
      gsap.fromTo("[data-mobile-pages] [data-sign]", { clipPath: "inset(0 100% 0 0)" }, {
        clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power1.inOut", stagger: 0.6,
        scrollTrigger: { trigger: "[data-mobile-pages] [data-sign]", start: "top 90%" },
      });
    });
    mm.add("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const rx = gsap.quickTo("[data-tilt]", "rotationX", { duration: 0.8, ease: "power3" });
      const ry = gsap.quickTo("[data-tilt]", "rotationY", { duration: 0.8, ease: "power3" });
      const sx = gsap.quickTo("[data-floor]", "xPercent", { duration: 0.8, ease: "power3" });
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
        rx(-ny * 14);
        ry(nx * 18);
        sx(-50 - nx * 12);
      };
      root.current!.addEventListener("pointermove", onMove);
      return () => root.current?.removeEventListener("pointermove", onMove);
    });
    // 글과 엽서가 차례로 놓여요
    gsap.from("[data-copy] > :not([data-cards])", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 60%" } });
    gsap.from("[data-cards]", { y: 140, rotate: 14, opacity: 0, duration: 1.1, delay: 0.3, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 60%" } });
  }, { scope: root });

  const cards = PHOTOS.map((p) => (
    <div key={p.src} className="relative h-full w-full">
      <img src={p.src} alt={p.alt} draggable={false} />
    </div>
  ));

  return (
    <section id="about" ref={root} className="relative isolate bg-terminal lg:h-[100svh]">
      <Sky />
      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-14 px-5 pb-16 pt-[calc(var(--bar)+48px)] sm:px-8 lg:flex-row lg:items-center lg:gap-12 lg:pb-0 lg:pt-[var(--bar)]">
        <div data-copy className="lg:w-[32%]">
          {/* 구절 단위(inline-block)로만 줄이 바뀌어요 */}
          <p className="text-balance text-[clamp(24px,2.3vw,34px)] font-semibold leading-[1.45] tracking-[-0.02em] [&>span]:inline-block">
            <span>웹, 데스크톱 앱 그리고&nbsp;</span><span>AI까지 다양한 분야에&nbsp;</span><span>호기심을 가지고&nbsp;</span><span>공부하고 있어요.</span>
          </p>
          <p className="mt-4 text-[17px] leading-7 text-sub [&>span]:inline-block">
            <span>뛰어난 습득력과 적용력을 바탕으로&nbsp;</span><span>더욱 발전하는 중이에요.</span>
          </p>
          <div className="mt-10 border-t border-line pt-6">
            <p className="font-semibold">취미로 사진도 찍고 있어요!</p>
            <p className="mt-1 text-sm text-muted">
              사진을 끌어서 넘겨 보세요. 더 많은 사진은{" "}
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="font-medium text-accent underline underline-offset-4 hover:text-accent-strong">인스타그램</a>에 있어요.
            </p>
          </div>
          <div data-cards className="mt-7 h-[190px] w-[285px] sm:h-[200px] sm:w-[300px]">
            <Stack cards={cards} layout="pile" visible={4} frame={8} frameColor="#ffffff" radius={2} sendToBackOnClick />
          </div>
        </div>

        {/* 펼친 여권의 오른쪽 끝이 헤더 오른쪽 끝(게이트 번호)에 맞아요 */}
        <div className="passport-scene relative flex flex-1 justify-center lg:justify-end">
          <div className="relative hidden lg:block">
            {/* 바닥 그림자 */}
            <div data-floor aria-hidden className="pointer-events-none absolute bottom-[4%] left-1/2 h-12 w-[52%] -translate-x-1/2 rounded-[50%] bg-[#191f28]/30 blur-2xl" />
            <div data-tilt className="relative [transform-style:preserve-3d]">
              <div data-book className="book" style={{ height: "min(620px, 40vw, calc(100svh - 130px))", aspectRatio: "1.42" }}>
                {/* 뒤표지: 종이보다 살짝 커서 테두리가 보여요 */}
                <div aria-hidden className="pp-cover absolute left-1/2 top-0 h-full w-1/2 rounded-r-xl [transform:translateZ(-10px)]" />
                {/* 오른쪽 종이 묶음 */}
                {[5, 4, 3, 2, 1].map((i) => (
                  <div key={i} aria-hidden className="pp-edge absolute left-1/2 top-[4px] h-[calc(100%-8px)] w-[calc(50%-5px)] rounded-r-lg" style={{ transform: `translateZ(${-i * 1.6}px) translateX(${i * 0.6}px)` }} />
                ))}
                <div className="pp-page absolute left-1/2 top-[4px] h-[calc(100%-8px)] w-[calc(50%-5px)] overflow-hidden rounded-r-lg">
                  <Stamps uid="d" />
                  <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#191f28]/15 to-transparent" />
                </div>
                <div data-cover className="absolute left-1/2 top-0 h-full w-1/2 origin-left [transform-style:preserve-3d]">
                  <Cover />
                  {/* 표지 안쪽 면: 펼치면 왼쪽 종이 둘레로 케이스 테두리가 보여요 */}
                  <div aria-hidden className="face pp-cover absolute inset-0 rounded-l-xl [transform:translateZ(-0.5px)_rotateY(180deg)]" />
                  {/* 표지 안쪽에 붙은 종이들: 펼치면 왼쪽 두께가 돼요 */}
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} aria-hidden className="face pp-edge absolute right-[5px] top-[4px] h-[calc(100%-8px)] w-[calc(100%-5px)] rounded-l-lg" style={{ transform: `translateZ(${-i * 1.6}px) rotateY(180deg)` }} />
                  ))}
                  <div className="face pp-page absolute right-[5px] top-[4px] h-[calc(100%-8px)] w-[calc(100%-5px)] overflow-hidden rounded-l-lg [transform:translateZ(-8px)_rotateY(180deg)]">
                    <DataPage />
                    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[#191f28]/15 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div data-mobile-pages className="grid w-full gap-4 md:grid-cols-2 lg:hidden">
            <div className="pp-page min-h-[520px] rounded-lg"><DataPage /></div>
            <div className="pp-page rounded-lg"><Stamps uid="m" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

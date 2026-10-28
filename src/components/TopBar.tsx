"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SplitFlap from "@/components/SplitFlap";
import { Picto, type PictoName } from "@/components/Picto";
import { ScrollTrigger } from "@/lib/gsap";

const LINKS: { id: string; gate: string; ko: string; en: string; picto: PictoName }[] = [
  { id: "about", gate: "A1", ko: "여권 심사", en: "Passport", picto: "passport" },
  { id: "skills", gate: "B2", ko: "수하물", en: "Baggage", picto: "baggage" },
  { id: "flights", gate: "C3", ko: "출발", en: "Departures", picto: "departures" },
];

/**
 * 처음(우주)과 마지막(안내)에는 투명, 그 사이는 흰 헤더. 지금 있는 구역에 파란 불이 들어오고, 오른쪽 게이트 번호가 넘어가요.
 * 태블릿부터는 메뉴를 늘어놓고, 모바일은 햄버거 버튼으로 전체 화면 메뉴를 열어요.
 */
export default function TopBar() {
  const [active, setActive] = useState<string | null>(null);
  const [solid, setSolid] = useState(false);
  const [dark, setDark] = useState(false); // 마지막 안내 구역 위
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const bar = getComputedStyle(document.documentElement).getPropertyValue("--bar").trim() || "52px";
    // 구역마다 "시작 지점" 하나만 둬요. 내려가며 지나면 그 구역, 거슬러 올라가면 앞 구역으로 바뀌어요.
    // (여권 섹션은 고정(pin)되는 요소라, 그걸 기준으로 끝 지점을 잡으면 고정 구간 길이만큼 어긋나요)
    let pastAbout = false, atContact = false;
    const paint = () => { setSolid(pastAbout && !atContact); setDark(atContact); };
    const ids = [...LINKS.map((l) => l.id), "contact"];
    const sts = [
      // 여권 심사부터 출발까지만 흰 헤더. 마지막 안내 구역이 헤더 밑으로 들어오면 다시 투명해져요.
      ScrollTrigger.create({ trigger: "#about", start: "top bottom", onEnter: () => { pastAbout = true; paint(); }, onLeaveBack: () => { pastAbout = false; paint(); } }),
      ScrollTrigger.create({ trigger: "#contact", start: `top ${bar}`, onEnter: () => { atContact = true; paint(); }, onLeaveBack: () => { atContact = false; paint(); } }),
      ...ids.map((id, i) =>
        ScrollTrigger.create({
          trigger: `#${id}`, start: "top center",
          onEnter: () => setActive(id === "contact" ? null : id),
          onLeaveBack: () => setActive(ids[i - 1] ?? null),
        }),
      ),
    ];
    return () => sts.forEach((s) => s.kill());
  }, []);

  // 메뉴가 열려 있으면 뒤 페이지가 스크롤되지 않고, Esc나 화면이 넓어지면 닫혀요
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = matchMedia("(min-width: 768px)");
    const onWide = () => mq.matches && setOpen(false);
    addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      document.documentElement.style.overflow = "";
      removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [open]);

  // 스크롤 잠금을 먼저 풀어야 메뉴에서 고른 구역으로 이동할 수 있어요
  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.documentElement.style.overflow = "";
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const current = LINKS.find((l) => l.id === active);
  const light = solid || open; // 흰 바탕 헤더

  return (
    <header className={`fixed inset-x-0 top-0 z-40 h-[var(--bar)] border-b transition-[background-color,border-color] duration-300 ${light ? "border-surface bg-white" : `border-transparent ${dark ? "bg-[linear-gradient(#08090c_0%,rgba(8,9,12,.55)_35%,rgba(8,9,12,0)_100%)] bg-clip-padding" : "bg-transparent"}`}`}>
      {/* 마지막 구역에선 위쪽을 사진의 어두운 색으로 덮어요. 화면 배율에 따라 앞 섹션의 흰 바탕이 한 줄 비치는 걸 막아요. */}
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-4 px-5 sm:px-8">
        <a href="#top" aria-label="맨 위로" className="shrink-0" onClick={(e) => open && go(e, "top")}>
          <Image src="/logo.png" alt="JINSNATION" width={2172} height={724} priority className={`h-7 w-auto transition-[filter] duration-300 sm:h-8 ${light ? "logo-dark" : ""}`} />
        </a>
        <nav aria-label="구역" className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const on = l.id === active;
            return (
              <a
                key={l.id}
                href={`#${l.id}`}
                aria-current={on ? "location" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[15px] font-semibold transition-colors duration-200 ${on ? "bg-accent-soft text-accent-strong" : solid ? "text-sub hover:bg-surface hover:text-ink" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
              >
                <Picto name={l.picto} className={`hidden h-[18px] w-[18px] lg:block ${on ? "" : "opacity-50"}`} />
                {l.ko}
              </a>
            );
          })}
        </nav>
        <span className="gate ml-auto flex w-12 justify-end text-[16px] md:ml-0 md:w-16 md:text-[18px]" aria-hidden>
          {current && <SplitFlap text={current.gate} />}
        </span>

        {/* 모바일 햄버거: 세 줄이 X로 바뀌어요 */}
        <button
          type="button"
          data-menu-button
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
          className={`-mr-2 grid h-11 w-11 place-items-center rounded-full md:hidden ${light ? "text-ink" : "text-white"}`}
        >
          <span className="relative block h-3.5 w-5" aria-hidden>
            <span className={`absolute left-0 top-0 h-[2px] w-5 rounded-full bg-current transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`absolute left-0 top-[6px] h-[2px] w-5 rounded-full bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-[12px] h-[2px] w-5 rounded-full bg-current transition-transform duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {/* 모바일 전체 화면 메뉴: 공항 안내판처럼 게이트 번호와 구역 이름 */}
      <nav
        id="mobile-menu"
        aria-label="구역"
        className={`fixed inset-x-0 bottom-0 top-[var(--bar)] flex flex-col bg-white px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 transition-[opacity,transform,visibility] duration-300 md:hidden ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}
      >
        <ul className="divide-y divide-line border-y border-line">
          {LINKS.map((l, i) => {
            const on = l.id === active;
            return (
              <li key={l.id} className={`transition-[opacity,transform] duration-500 ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`} style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}>
                <a href={`#${l.id}`} onClick={(e) => go(e, l.id)} aria-current={on ? "location" : undefined} className="flex items-center gap-4 py-5">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[17px] font-bold ${on ? "bg-accent text-white" : "bg-accent-soft text-accent-strong"}`}>{l.gate}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[24px] font-bold leading-tight">{l.ko}</span>
                    <span className="block text-[14px] text-muted">{l.en}</span>
                  </span>
                  <Picto name={l.picto} className={`h-6 w-6 ${on ? "text-accent" : "text-muted"}`} />
                </a>
              </li>
            );
          })}
        </ul>
        <a href="#contact" onClick={(e) => go(e, "contact")} className="btn mt-auto justify-center">
          연락하기 <span className="arr" aria-hidden>→</span>
        </a>
      </nav>
    </header>
  );
}

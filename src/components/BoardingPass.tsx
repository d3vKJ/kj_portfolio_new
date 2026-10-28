"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import SkillIcon from "@/components/SkillIcon";
import ProposalModal from "@/components/ProposalModal";
import { Plane } from "@/components/Hero";
import { KIND_COLOR, type Flight } from "@/lib/flights";
import { gsap, useGSAP } from "@/lib/gsap";

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[12px] text-paper-ink/55">{k}</dt>
      <dd className="mt-0.5 text-[18px] font-semibold leading-tight">{v}</dd>
    </div>
  );
}

export default function BoardingPass({ f, onClose }: { f: Flight; onClose: () => void }) {
  const ticket = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const proposalBtn = useRef<HTMLButtonElement>(null);
  const [proposalOpen, setProposalOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const back = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      html.style.overflow = prev;
      back?.focus({ preventScroll: true });
    };
  }, []);

  useGSAP(() => {
    // 발권기에서 밀려 나오듯 위에서부터 드러나요
    gsap.fromTo(ticket.current, { clipPath: "inset(0% 0% 100% 0%)", y: -24 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.55, ease: "power3.out", clearProps: "clipPath" });
    gsap.fromTo(overlay.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "none" });
  }, { scope: overlay });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !proposalOpen && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [onClose, proposalOpen]);

  const here = f.href === "/";

  return createPortal(
    <div ref={overlay} className="fixed inset-0 z-50 flex items-center justify-center bg-[#191f28]/50 [perspective:1400px] sm:p-6" onClick={onClose}>
      {/* 넓은 화면: 왼쪽 내용만 스크롤하고 오른쪽 떼는 쪽(버튼)은 늘 보여요.
          좁은 화면: 위아래로 쌓고 버튼은 아래 띠에 붙어 있어요. 폰에선 화면을 꽉 채워요. */}
      <div
        ref={ticket}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bp-title"
        onClick={(e) => e.stopPropagation()}
        className="ticket relative flex h-full w-full max-w-[1180px] flex-col overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,.6)] sm:h-auto sm:max-h-full sm:rounded-3xl lg:flex-row"
        style={{ ["--cut" as string]: "calc(100% - 20rem)" }}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between bg-accent pr-2 text-white sm:pr-3">
            <p className="flex items-center gap-3 py-3 pl-5 sm:py-3.5 sm:pl-6">
              <Image src="/logo.png" alt="JINSNATION" width={2172} height={724} className="h-5 w-auto sm:h-6" />
              <span className="text-[16px] font-semibold sm:text-[17px]">탑승권</span>
              <span className="text-white/60 max-sm:hidden">Boarding Pass</span>
            </p>
            <button ref={closeBtn} type="button" onClick={onClose} aria-label="탑승권 닫기" className="grid h-10 w-10 place-items-center rounded-full text-xl text-white/80 hover:bg-white/15 hover:text-white">✕</button>
          </div>

          {/* 무엇을 만들었는지 먼저: 이름 → 설명 → 화면 → 쓴 기술 */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8 lg:p-9">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-paper-ink/60 sm:text-[14px]">
              <span className="rounded-full px-3 py-1 font-semibold" style={{ color: KIND_COLOR[f.kind], background: `color-mix(in srgb, ${KIND_COLOR[f.kind]} 14%, transparent)` }}>{f.kind}</span>
              {f.category === "Desktop" ? "데스크톱 앱" : "웹"} · {f.year} · {f.solo ? "1인 개발" : "팀 프로젝트"}
              <span className="lg:hidden">· {f.flight} · 게이트 {f.gate}</span>
            </p>
            <h2 id="bp-title" className="mt-3 text-[clamp(28px,4vw,46px)] font-bold leading-tight tracking-[-0.02em]">{f.nameKo}</h2>
            <p className="mt-3 max-w-[60ch] text-[15px] leading-7 text-paper-ink/80 sm:text-[17px] sm:leading-8">{f.body}</p>

            {f.image && <img decoding="async" src={f.image} alt={`${f.nameKo} 화면`} className="mt-6 aspect-[16/9] w-full rounded-xl border border-paper-ink/10 object-cover object-top sm:mt-7 sm:rounded-2xl" />}

            <p className="mt-7 text-[14px] font-semibold text-paper-ink/60 sm:mt-8 sm:text-[15px]">사용한 기술</p>
            <ul className="mt-3 grid gap-2.5 md:grid-cols-2">
              {f.techUsage.map((t) => (
                <li key={t.skill} className="rounded-2xl bg-paper-ink/[0.045] p-3.5 sm:p-4">
                  <p className="flex items-center gap-2 text-[15px] font-semibold sm:text-[16px]"><SkillIcon name={t.skill} size={20} onPaper />{t.skill}</p>
                  <p className="mt-1.5 text-[14px] leading-6 text-paper-ink/70">{t.usage}</p>
                </li>
              ))}
            </ul>
            {!f.code && f.codeNote && <p className="mt-6 rounded-xl bg-paper-ink/[0.06] p-4 text-[14px] leading-6 text-paper-ink/70">{f.codeNote}</p>}
          </div>
        </div>

        {/* 떼는 쪽: 넓으면 노선·정보·버튼·바코드, 좁으면 버튼 띠만 */}
        <div className="flex shrink-0 flex-col gap-6 overflow-y-auto border-dashed border-paper-ink/25 p-4 max-lg:border-t-2 sm:px-8 sm:py-5 lg:w-[20rem] lg:border-l-2 lg:p-8">
          <div className="flex items-center gap-3 max-lg:hidden">
            <div>
              <p className="text-[40px] font-bold leading-none">TAE</p>
              <p className="mt-1 text-[13px] text-paper-ink/55">대구</p>
            </div>
            <div className="flex flex-1 items-center gap-1.5 text-paper-ink/35">
              <span className="flex-1 border-t-2 border-dashed border-current" />
              <Plane className="h-5 w-5 rotate-90 text-paper-ink" />
              <span className="flex-1 border-t-2 border-dashed border-current" />
            </div>
            <div className="text-right">
              <p className="text-[40px] font-bold leading-none">{f.dest}</p>
              <p className="mt-1 max-w-[7rem] truncate text-[13px] text-paper-ink/55">{f.nameKo}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-paper-ink/15 py-4 max-lg:hidden">
            <Field k="승객" v="장경진" />
            <Field k="편명" v={f.flight} />
            <Field k="게이트" v={f.gate} />
            <Field k="좌석" v="1A" />
          </dl>

          <div className="flex flex-wrap gap-2 *:min-w-[9rem] *:flex-1 lg:flex-col lg:*:flex-none lg:gap-2.5">
            {here ? (
              <a href="#top" onClick={onClose} className="btn h-12 justify-center text-[15px] sm:h-14 sm:text-[17px]">지금 보고 있는 사이트예요</a>
            ) : (
              <a href={f.href} target="_blank" rel="noreferrer" className="btn h-12 justify-center text-[15px] sm:h-14 sm:text-[17px]">사이트 보기 <span className="arr">→</span></a>
            )}
            {f.code && <a href={f.code} target="_blank" rel="noreferrer" className="btn-line h-12 justify-center text-[15px] sm:h-14 sm:text-[17px]">코드 보기</a>}
            {f.proposal && (
              <button ref={proposalBtn} type="button" onClick={() => setProposalOpen(true)} className="btn-line h-12 justify-center text-[15px] sm:h-14 sm:text-[17px]">기획서 보기</button>
            )}
          </div>

          <div className="mt-auto max-lg:hidden">
            <div className="barcode h-14 text-paper-ink" aria-hidden />
            <p className="mt-1.5 font-mono text-[11px] text-paper-ink/50">{f.flight.replace(" ", "")}TAE{f.dest}{f.year}</p>
          </div>
        </div>
      </div>
      {f.proposal && (
        <div onClick={(e) => e.stopPropagation()}>
          <ProposalModal open={proposalOpen} src={f.proposal} onClose={() => setProposalOpen(false)} returnFocusRef={proposalBtn} />
        </div>
      )}
    </div>,
    document.body,
  );
}

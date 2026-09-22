"use client";

import Image from "next/image";

const INFO = [
  {
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5A2.25 2.25 0 0012.75 4.5h-1.5A2.25 2.25 0 009 6.75v1.5M8.25 21h7.5A2.25 2.25 0 0018 18.75v-7.5A2.25 2.25 0 0015.75 9h-7.5A2.25 2.25 0 006 11.25v7.5A2.25 2.25 0 008.25 21z" /></svg>,
    label: "Birth", value: "2002. 12. 06",
  },
  {
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
    label: "Location", value: "대한민국 대구광역시",
  },
  {
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
    label: "Email", value: "nova021206@kakao.com",
  },
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.529 2.341 1.087 2.912.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>,
    label: "GitHub", value: "github.com/d3vkj",
  },
];

const TIMELINE = [
  { year: "2026", title: "SBS아카데미컴퓨터아트학원 대구", desc: "Chat GPT & React 활용 스마트 UIUX 반응형 웹디자인 과정 수료 (예정)", current: true },
];

export default function AboutMe() {
  return (
    <section className="min-h-full pb-10 pl-[var(--content-pl)] pr-[var(--content-pr)] pt-[var(--header-space)] lg:h-full">
    <div className="mx-auto flex min-h-full max-w-[var(--content-max)] flex-col lg:h-full lg:flex-row">

      {/* ── 1열: 사진 ── */}
      <div className="flex flex-col items-center justify-center gap-6 border-white/[0.08] px-8 py-12 lg:flex-1 lg:border-r lg:py-0">
        <div className="flex flex-col items-center gap-6 lg:-translate-y-12">
          <div className="relative w-48 aspect-[3/4] overflow-hidden rounded-3xl glass-ios shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
            <Image
              src="/profile.png"
              alt="장경진 프로필 사진"
              fill
              sizes="192px"
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white/80">장경진</p>
            <p className="text-xs text-white/35 mt-1">Publisher / Front-End / Full-Stack</p>
          </div>
        </div>
      </div>

      {/* ── 2열: 내 정보 ── */}
      <div className="flex flex-col justify-center border-t border-white/[0.08] px-8 py-12 lg:flex-1 lg:border-t-0 lg:border-r lg:px-10 lg:py-0">
        <div className="flex w-full flex-col gap-5 lg:min-h-[410px] lg:-translate-y-12">
          <div className="flex flex-col justify-start lg:min-h-[136px]">
            <h2 className="section-title">About Me</h2>
            <p className="mt-2 text-sm text-white/45 leading-6">
              웹, 데스크톱 앱, 모바일 앱 그리고 AI까지<br />
              다양한 분야에 호기심을 가지고 공부하고 있어요.<br />
              뛰어난 습득력과 적용력을 바탕으로 더욱 발전하는 중이에요.
            </p>
          </div>

          <div className="h-px bg-white/[0.08]" />

          <div className="flex flex-col gap-2.5">
            {INFO.map(({ icon, label, value }) => (
              <div key={label} className="glass-ios flex items-center gap-4 rounded-2xl px-5 py-3.5">
                <span className="text-white/35 shrink-0">{icon}</span>
                <span className="text-[10px] text-white/25 uppercase tracking-widest w-16 shrink-0">{label}</span>
                <span className="text-sm text-white/65">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3열: History ── */}
      <div className="flex flex-col justify-center border-t border-white/[0.08] px-8 py-12 lg:flex-1 lg:border-t-0 lg:px-10 lg:py-0">
        <div className="flex w-full flex-col gap-5 lg:min-h-[410px] lg:-translate-y-12">
          <div className="flex flex-col justify-start lg:min-h-[136px]">
            <h2 className="section-title">History</h2>
            {/* <p className="mt-2 text-sm text-white/35 leading-6">
              경험
            </p> */}
          </div>

          <div className="h-px bg-white/[0.08]" />

          <div className="relative flex flex-col gap-0">
            {/* 수직 선 */}
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/[0.1]" />

            {TIMELINE.map((item, i) => (
              <div key={i} className="relative flex gap-6 pb-8 last:pb-0">
                <div className="relative w-2.5 h-2.5 shrink-0 self-start mt-[5px]">
                  {item.current ? (
                    <>
                      <span
                        className="absolute -inset-2.5 rounded-full"
                        style={{
                          background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
                          filter: "blur(3px)",
                          animation: "dotGlow 2.4s ease-in-out infinite",
                        }}
                      />
                      <span className="relative block w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent)" }} />
                    </>
                  ) : (
                    <span className="block w-2.5 h-2.5 rounded-full border border-white/25" />
                  )}
                </div>

                {/* 내용 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono text-white/30">{item.year}</span>
                    {item.current && (
                      <span className="glass-soft text-[9px] px-2 py-0.5 rounded-full text-white/45 uppercase tracking-widest">현재</span>
                    )}
                  </div>
                  <p className="text-base font-semibold text-white/80 leading-snug">{item.title}</p>
                  <p className="text-sm text-white/40 mt-1.5 leading-6">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
    </section>
  );
}

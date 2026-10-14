"use client";

import { useState } from "react";
import Image from "next/image";
import PhotoCarousel from "@/components/PhotoCarousel";

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
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
    label: "Instagram", value: "@jinsnation", href: "https://instagram.com/jinsnation",
  },
];

const TIMELINE = [
  { year: "2026", title: "SBS 아카데미 AIX 학원 대구", desc: "Chat GPT와 React를 활용한 스마트 UIUX 반응형 웹디자인 과정 수료", current: true },
  { year: "2025 ~", title: "치즈컴퍼니", desc: "멀티플레이 플랫폼 게임 서버 개발", current: true },
];

const CERTIFICATES = [
  { year: "2020", title: "운전면허 1종 보통" },
  { year: "2020", title: "전기기능사" },
];

export default function AboutMe() {
  const [photosOpen, setPhotosOpen] = useState(false);

  return (
    <section className="min-h-full pb-24 pl-[var(--content-pl)] pr-[var(--content-pr)] pt-[var(--header-space)] sm:pb-10 lg:h-full">
      <div className="mx-auto flex min-h-full max-w-[var(--content-max)] flex-col lg:h-full lg:flex-row">

        {/* ── 1열: 사진 ── */}
        <div className="flex flex-col items-center justify-center gap-6 border-ink/[0.08] px-4 py-10 sm:px-8 sm:py-12 lg:flex-1 lg:border-r lg:py-0">
          <div className="flex flex-col items-center gap-6 lg:-translate-y-12">
            <div className="relative w-40 aspect-[3/4] overflow-hidden rounded-3xl glass-ios shadow-2xl transition-transform duration-300 hover:scale-[1.02] sm:w-48">
              <Image
                src="/profile.jpg"
                alt="장경진 프로필 사진"
                fill
                sizes="192px"
                className="object-cover object-center"
                priority
              />
            </div>
            <div className="flex flex-col items-center px-2 text-center">
              <p className="text-lg font-semibold text-ink/80">장경진</p>
              <p className="hobby-glow mt-3 text-[16px] leading-snug tracking-[-0.02em] break-keep">취미로 사진도 찍고 있어요!</p>
              <button
                type="button"
                onClick={() => setPhotosOpen(true)}
                className="glass-soft mt-3 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink/80 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 19.5h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zM8.25 8.625a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z" />
                </svg>
                사진 보기
              </button>
            </div>
          </div>
        </div>

        {/* ── 2열: 내 정보 ── */}
        <div className="flex flex-col justify-center border-t border-ink/[0.08] px-4 py-10 sm:px-8 sm:py-12 lg:flex-1 lg:border-t-0 lg:border-r lg:px-10 lg:py-0">
          <div className="flex w-full min-w-0 flex-col gap-5 lg:min-h-[410px] lg:-translate-y-12">
            <div className="@container flex w-full flex-col justify-start">
              <p className="text-[10px] uppercase tracking-[0.35em] text-ink/30">About</p>
              <h2 className="mt-3 text-[clamp(0.75rem,5.25cqw,1.85rem)] font-semibold leading-snug tracking-tight text-ink break-keep">
                웹, 데스크톱 앱 그리고 AI까지<br />
                다양한 분야에 호기심을 가지고 공부하고 있어요.
              </h2>
              <p className="mt-3 text-base leading-7 text-ink/70 break-keep">
                뛰어난 습득력과 적용력을 바탕으로 더욱 발전하는 중이에요.
              </p>
            </div>

            <div className="h-px bg-ink/[0.08]" />

            <div className="flex min-w-0 flex-col">
              {INFO.map(({ icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex min-w-0 items-center gap-3 border-b border-ink/[0.06] py-2.5 last:border-b-0"
                >
                  <span className="shrink-0 text-ink/30 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
                  <span className="w-16 shrink-0 text-[10px] uppercase tracking-[0.06em] text-ink/30">
                    {label}
                  </span>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 break-all text-sm leading-snug text-ink/55 underline-offset-2 transition-colors hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="min-w-0 flex-1 break-all text-sm leading-snug text-ink/55">{value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3열: History ── */}
        <div className="flex flex-col justify-center border-t border-ink/[0.08] px-4 py-10 sm:px-8 sm:py-12 lg:flex-1 lg:border-t-0 lg:px-10 lg:py-0">
          <div className="flex w-full min-w-0 flex-col gap-5 lg:min-h-[410px] lg:-translate-y-12">
            <div className="flex flex-col gap-3">
              <h2 className="section-title">History</h2>
              <div className="h-px bg-ink/[0.08]" />
            </div>

            <div className="relative flex min-w-0 flex-col gap-0">
              {/* 수직 선 */}
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-ink/[0.1]" />

              {TIMELINE.map((item, i) => (
                <div key={i} className="relative flex min-w-0 gap-4 pb-6 last:pb-0 sm:gap-6">
                  <div className="relative mt-[5px] h-2.5 w-2.5 shrink-0 self-start">
                    {item.current ? (
                      <>
                        {/* 현재 항목 발광 dot */}
                        <span
                          className="absolute -inset-2.5 rounded-full"
                          style={{
                            background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
                            filter: "blur(3px)",
                            animation: "dotGlow 2.4s ease-in-out infinite",
                          }}
                        />
                        <span className="relative block h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent)" }} />
                      </>
                    ) : (
                      <span className="block h-2.5 w-2.5 rounded-full border border-ink/25" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-1.5 text-xs text-ink/30">{item.year}</p>
                    <p className="text-base font-semibold leading-snug break-keep text-ink/80">{item.title}</p>
                    <p className="section-desc mt-1.5 text-sm leading-6 break-keep">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex flex-col gap-3 border-t border-ink/[0.08] pt-5"
              style={{ fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/70">Certificates</h3>
              <ul className="flex min-w-0 flex-col gap-2">
                {CERTIFICATES.map((item) => (
                  <li key={item.title} className="glass-soft flex min-w-0 items-center justify-between gap-3 rounded-2xl px-4 py-3">
                    <span className="min-w-0 text-sm font-medium leading-snug text-ink/90">{item.title}</span>
                    <span className="shrink-0 text-[11px] text-ink/45">{item.year}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
      <PhotoCarousel open={photosOpen} onClose={() => setPhotosOpen(false)} />
    </section>
  );
}

"use client"

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, usePresence } from "framer-motion"
import Image from "next/image"
import { PHOTOS } from "@/data/photos"

const STAGE_MS = 280

const PresenceShell = ({ reduceMotion, children }: { reduceMotion: boolean; children: ReactNode }) => {
  const [isPresent, safeToRemove] = usePresence()

  useEffect(() => {
    if (isPresent) return
    const id = window.setTimeout(safeToRemove, reduceMotion ? 0 : STAGE_MS)
    return () => window.clearTimeout(id)
  }, [isPresent, reduceMotion, safeToRemove])

  const motionClass = reduceMotion ? "" : isPresent ? "photo-modal-in" : "photo-modal-out"

  return <div className={`fixed inset-0 z-[70] ${motionClass}`}>{children}</div>
}

type PhotoCarouselProps = {
  open: boolean
  onClose: () => void
}

const cardPose = (diff: number, motionOff: boolean) => {
  const distance = Math.abs(diff)
  const hidden = distance > 2.2
  const z = motionOff ? 0 : -distance * 120
  const rotate = motionOff ? 0 : diff * -46
  const shift = motionOff ? `${diff * 108}%` : `calc(${diff} * var(--photo-shift) * 1%)`
  const scale = 1 - distance * (motionOff ? 0.04 : 0.1)

  return {
    hidden,
    transform: `translate(-50%, -50%) translateX(${shift}) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`,
    zIndex: 10 - Math.round(distance),
    opacity: hidden ? 0 : 1 - distance * 0.22,
  }
}

const wrapOffset = (index: number, active: number, count: number) => {
  let diff = index - active
  diff = ((diff % count) + count) % count
  if (diff > count / 2) diff -= count
  return diff
}

export default function PhotoCarousel({ open, onClose }: PhotoCarouselProps) {
  const [active, setActive] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [seenOpen, setSeenOpen] = useState(open)
  if (open !== seenOpen) {
    setSeenOpen(open)
    if (open) {
      setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      setActive(0)
    }
  }
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  const dragRef = useRef<{ x: number; moved: boolean } | null>(null)
  const draggedRef = useRef(false)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current()
      if (event.key === "ArrowLeft") setActive((value) => (value - 1 + PHOTOS.length) % PHOTOS.length)
      if (event.key === "ArrowRight") setActive((value) => (value + 1) % PHOTOS.length)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      previous?.focus()
    }
  }, [open])

  if (typeof document === "undefined") return null

  const photo = PHOTOS[active]
  const step = (direction: number) => {
    setActive((value) => (value + direction + PHOTOS.length) % PHOTOS.length)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    dragRef.current = { x: event.clientX, moved: false }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    if (Math.abs(event.clientX - dragRef.current.x) > 10) dragRef.current.moved = true
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const dx = event.clientX - dragRef.current.x
    draggedRef.current = dragRef.current.moved
    dragRef.current = null
    if (dx > 56) step(-1)
    else if (dx < -56) step(1)
  }

  const stopClose = (event: ReactMouseEvent<HTMLElement>) => {
    event.stopPropagation()
  }

  return createPortal(
    <AnimatePresence>
      {open && photo && (
        <PresenceShell key="photo-carousel" reduceMotion={reduceMotion}>
          <div className="photo-modal-backdrop absolute inset-0" onClick={() => onCloseRef.current()} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-carousel-title"
            className="relative z-10 flex h-full flex-col items-center justify-center px-4 outline-none sm:px-8"
            onClick={() => onCloseRef.current()}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onCloseRef.current()
              }}
              aria-label="사진 닫기"
              className="photo-rise glass-ios absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex w-full max-w-5xl flex-col items-center" onClick={stopClose}>
              <p
                id="photo-carousel-title"
                className="photo-rise mb-6 text-[11px] font-medium uppercase tracking-[0.28em] text-white/45"
              >
                Photos
              </p>

              <div
                className="photo-carousel-stage relative mx-auto h-[min(64vh,560px)] w-full cursor-grab touch-pan-y active:cursor-grabbing"
                style={{ perspective: reduceMotion ? undefined : "1100px" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => {
                  dragRef.current = null
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    transform: reduceMotion ? undefined : "rotateX(12deg)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="pointer-events-none absolute bottom-[8%] left-1/2 h-10 w-[42%] -translate-x-1/2 rounded-[100%] bg-black/70 blur-2xl" />
                  {PHOTOS.map((item, index) => {
                    const diff = wrapOffset(index, active, PHOTOS.length)
                    const pose = cardPose(diff, reduceMotion)
                    const isActive = diff === 0

                    return (
                      <button
                        key={item.src}
                        type="button"
                        tabIndex={pose.hidden || isActive ? -1 : 0}
                        aria-hidden={pose.hidden || undefined}
                        aria-label={isActive || pose.hidden ? undefined : `${item.alt} 보기`}
                        aria-current={isActive ? "true" : undefined}
                        onClick={() => {
                          if (draggedRef.current) {
                            draggedRef.current = false
                            return
                          }
                          if (!isActive) setActive(index)
                        }}
                        className="carousel-card absolute left-1/2 top-1/2 block overflow-hidden rounded-2xl border border-white/20 bg-black shadow-[0_30px_60px_-24px_rgba(0,0,0,0.85)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        style={{
                          transform: pose.transform,
                          transformStyle: "preserve-3d",
                          zIndex: pose.zIndex,
                          opacity: pose.opacity,
                          visibility: pose.hidden ? "hidden" : "visible",
                          transition: reduceMotion ? "none" : "transform 620ms cubic-bezier(0.22, 1, 0.36, 1), opacity 620ms ease",
                        }}
                      >
                        <Image
                          src={item.src}
                          alt={isActive ? item.alt : ""}
                          width={item.width}
                          height={item.height}
                          sizes="900px"
                          priority={index < 3}
                          className="block h-auto max-w-none"
                          style={{
                            width: `min(88vw, 900px, calc(min(56vh, 480px) * ${item.width} / ${item.height}))`,
                            height: "auto",
                            maxWidth: "none",
                            aspectRatio: `${item.width} / ${item.height}`,
                          }}
                          draggable={false}
                        />
                        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/25 to-transparent" />
                      </button>
                    )
                  })}
                </div>
                <div className="photo-stage-veil absolute inset-0 z-30" />
              </div>

              <div className="photo-rise mt-4 flex w-full max-w-lg items-center justify-center gap-4 px-2 sm:gap-6">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="이전 사진"
                  className="glass-ios flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                  <p className="text-sm text-white/45">{photo.date}</p>
                  <p className="text-base font-medium text-white/90">{photo.alt}</p>
                </div>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="다음 사진"
                  className="glass-ios flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="photo-rise photo-rise-late mt-3 flex flex-col items-center gap-2 text-center">
                <a
                  href={photo.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white/55 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  인스타그램에서 보기
                </a>
                <p className="text-xs text-white/35">
                  {active + 1} / {PHOTOS.length}
                </p>
              </div>
            </div>
          </div>
        </PresenceShell>
      )}
    </AnimatePresence>,
    document.body,
  )
}

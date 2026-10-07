"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type Block =
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

type Section = {
  id: string;
  index: string;
  title: string;
  blocks: Block[];
};

function parseProposal(md: string): { title: string; sections: Section[] } {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let title = "";
  const sections: Section[] = [];
  let current: Section | null = null;
  let list: string[] | null = null;

  const flushList = () => {
    if (list && current) current.blocks.push({ type: "ul", items: list });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("# ")) {
      title = line.slice(2).trim();
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      const heading = line.slice(3).trim();
      const match = heading.match(/^(\d+)\.\s*(.+)$/);
      current = {
        id: `proposal-section-${sections.length + 1}`,
        index: match ? match[1].padStart(2, "0") : String(sections.length + 1).padStart(2, "0"),
        title: match ? match[2] : heading,
        blocks: [],
      };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith("### ")) {
      flushList();
      current.blocks.push({ type: "h3", text: line.slice(4).trim() });
      continue;
    }
    if (line.startsWith("- ")) {
      if (!list) list = [];
      list.push(line.slice(2).trim());
      continue;
    }
    flushList();
    current.blocks.push({ type: "p", text: line });
  }
  flushList();
  return { title, sections };
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function ProposalModal({
  open,
  src,
  onClose,
  returnFocusRef,
}: {
  open: boolean;
  src: string;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<{ title: string; sections: Section[] } | null>(null);
  const [error, setError] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(false);
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const parsed = parseProposal(text);
        setDoc(parsed);
        setActiveId(parsed.sections[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, src]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button, a[href]")].filter(
        (el) => !el.hasAttribute("disabled"),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
      if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
    };
  }, [open, returnFocusRef]);

  useEffect(() => {
    if (!open || !activeId || !dialogRef.current) return;
    const current = dialogRef.current.querySelector<HTMLElement>(`[aria-current="true"]`);
    current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [open, activeId]);

  useEffect(() => {
    if (!open || !doc || !scrollerRef.current) return;
    const root = scrollerRef.current;
    const nodes = doc.sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => node !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { root, rootMargin: "0px 0px -65% 0px", threshold: 0 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [open, doc]);

  const scrollTo = (id: string) => {
    const scroller = scrollerRef.current;
    const target = document.getElementById(id);
    if (!scroller || !target) return;
    const sticky = scroller.querySelector<HTMLElement>("[data-proposal-toc]");
    const stickyHeight = sticky && getComputedStyle(sticky).display !== "none" ? sticky.offsetHeight : 0;
    const top = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - stickyHeight - 12;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
    setActiveId(id);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="proposal-backdrop"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="proposal-title"
            className="glass-modal flex h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-none outline-none sm:h-auto sm:max-h-[min(88vh,860px)] sm:rounded-2xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-ink/[0.08] px-5 py-4 sm:px-7 sm:py-5">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink/40">기획안</p>
                <h2 id="proposal-title" className="mt-1 text-lg font-semibold leading-snug tracking-tight text-ink sm:text-xl">
                  {doc?.title || "다이몬 기획안"}
                </h2>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="기획안 닫기"
                className="glass-ios flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink/70 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="flex min-h-0 flex-1">
              {doc && doc.sections.length > 0 && (
                <nav aria-label="기획안 목차" className="hidden min-h-0 w-48 shrink-0 overflow-y-auto border-r border-ink/[0.08] px-3 py-5 lg:block">
                  <ol className="space-y-0.5">
                    {doc.sections.map((section) => {
                      const active = section.id === activeId;
                      return (
                        <li key={section.id}>
                          <button
                            type="button"
                            onClick={() => scrollTo(section.id)}
                            aria-current={active ? "true" : undefined}
                            className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[13px] leading-snug transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                            style={{
                              color: active ? "var(--fg)" : "color-mix(in srgb, var(--fg) 42%, transparent)",
                              background: active ? "color-mix(in srgb, var(--accent) 14%, transparent)" : undefined,
                            }}
                          >
                            <span className="w-5 shrink-0 font-mono text-[11px] tabular-nums">{section.index}</span>
                            <span>{section.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </nav>
              )}

              <div ref={scrollerRef} className="relative min-h-0 flex-1 overflow-y-auto">
                {doc && doc.sections.length > 0 && (
                  <div data-proposal-toc className="sticky top-0 z-10 border-b border-ink/[0.08] bg-[var(--modal-bg)] px-4 py-2 backdrop-blur-md lg:hidden">
                    <div className="flex gap-1.5 overflow-x-auto">
                      {doc.sections.map((section) => {
                        const active = section.id === activeId;
                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => scrollTo(section.id)}
                            aria-current={active ? "true" : undefined}
                            className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-[13px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                            style={{
                              color: active ? "var(--fg)" : "color-mix(in srgb, var(--fg) 45%, transparent)",
                              background: active ? "color-mix(in srgb, var(--accent) 16%, transparent)" : "transparent",
                            }}
                          >
                            {section.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <article className="mx-auto w-full max-w-[40rem] px-5 py-7 sm:px-8 sm:py-9">
                  {error && <p className="text-sm text-ink/50">기획안을 불러오지 못했습니다.</p>}
                  {!doc && !error && <p className="text-sm text-ink/40">불러오는 중</p>}
                  {doc?.sections.map((section) => (
                    <section key={section.id} id={section.id} className="scroll-mt-4 border-t border-ink/[0.08] py-8 first:border-t-0 first:pt-0">
                      <h3 className="flex items-baseline gap-3 text-lg font-semibold tracking-tight text-ink">
                        <span className="font-mono text-[12px] font-medium tabular-nums text-ink/35">{section.index}</span>
                        {section.title}
                      </h3>
                      <div className="mt-4 space-y-3">
                        {section.blocks.map((block, i) => {
                          if (block.type === "h3") {
                            return (
                              <h4 key={i} className="pt-3 text-[15px] font-semibold tracking-tight text-ink/90">
                                {block.text}
                              </h4>
                            );
                          }
                          if (block.type === "ul") {
                            return (
                              <ul key={i} className="space-y-2.5">
                                {block.items.map((item) => (
                                  <li key={`${section.id}-${i}-${item}`} className="flex gap-3 text-[15px] leading-7 text-ink/75 sm:text-base sm:leading-8">
                                    <span aria-hidden className="mt-[0.72em] h-1 w-1 shrink-0 rounded-full bg-ink/35" />
                                    <span>
                                      <RichText text={item} />
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          return (
                            <p key={i} className="text-[15px] leading-7 text-ink/75 sm:text-base sm:leading-8">
                              <RichText text={block.text} />
                            </p>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                  {doc && <div aria-hidden className="h-[40vh]" />}
                </article>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

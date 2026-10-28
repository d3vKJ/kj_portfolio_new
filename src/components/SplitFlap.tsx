"use client";

import { useEffect, useRef, useState } from "react";
import { isHangul, sequence } from "@/lib/flap";

type Props = {
  text: string;
  /** 칸 수. 짧은 글자는 공백으로 채워요. */
  length?: number;
  /** false면 빈 칸으로 기다려요. */
  run?: boolean;
  delay?: number;
  className?: string;
};

/** 공항 출발 안내판처럼 글자가 촤라락 넘어가는 텍스트 */
export default function SplitFlap({ text, length, run = true, delay = 0, className = "" }: Props) {
  const target = (length ? text.padEnd(length, " ").slice(0, length) : text).split("");
  const [chars, setChars] = useState<string[]>(() => target.map(() => " "));
  const key = target.join("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!run) return;
    const goal = key.split("");
    setChars((prev) => goal.map((_, i) => prev[i] ?? " "));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setChars(goal);
      return;
    }
    const seqs = goal.map(sequence);
    let step = 0;
    const start = window.setTimeout(() => {
      timer.current = window.setInterval(() => {
        step++;
        setChars(seqs.map((s) => s[Math.min(step, s.length - 1)]));
        if (seqs.every((s) => step >= s.length - 1)) window.clearInterval(timer.current);
      }, 70);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer.current);
    };
  }, [key, run, delay]);

  return (
    <span className={`inline-flex ${className}`}>
      <span className="sr-only">{text}</span>
      {target.map((t, i) => {
        const c = chars[i] ?? " ";
        return (
          <span key={i} aria-hidden className={`flap ${isHangul(t) ? "wide" : ""} ${c === " " ? "blank" : ""}`}>
            <span key={c} className="flap-ch">{c === " " ? " " : c}</span>
          </span>
        );
      })}
    </span>
  );
}

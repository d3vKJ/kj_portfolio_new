"use client";

import { useSyncExternalStore } from "react";

/** 처음 그리기 전에 테마를 정해요: 고른 적 있으면 그대로, 아니면 기기 설정을 따라요. layout의 <head>에 그대로 넣어요. */
export const THEME_SCRIPT = `try{document.documentElement.dataset.theme=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){}`;

const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};

/** 지금 다크 모드인지. html의 data-theme이 바뀌면 다시 그려요. */
export const useDark = () => useSyncExternalStore(subscribe, () => document.documentElement.dataset.theme === "dark", () => false);

export function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

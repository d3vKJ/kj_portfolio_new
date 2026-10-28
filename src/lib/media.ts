"use client";

import { useSyncExternalStore } from "react";

/** 폰 폭(갤럭시 Z 폴드 겉화면 포함). 이 아래에선 3D·스크롤 연출 없이 목록과 카드로만 보여 줘요. Tailwind md 경계와 같아요. */
export const NARROW = "(max-width: 767px)";

export const isNarrow = () => matchMedia(NARROW).matches;

const subscribe = (cb: () => void) => {
  const mq = matchMedia(NARROW);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * 폭이 폰 크기인지. 3D 장면 effect의 의존성에 넣고, effect 안에선 isNarrow()로 바로 확인해요.
 * (서버 값은 false라 하이드레이션 직후 한 번은 false로 돌아도 effect가 isNarrow()에서 멈춰요)
 */
export const useNarrow = () => useSyncExternalStore(subscribe, isNarrow, () => false);

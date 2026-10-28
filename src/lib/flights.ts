import { PROJECTS, type Project } from "@/data/projects";

export type Flight = Project & { flight: string; kind: string; gate: string; body: string; dest: string };

const KIND: Record<string, string> = { "개인 프로젝트": "개인", "외주 작업": "외주", "클론 작업": "클론", "실무 도구": "실무" };
/** 계류장에 이 순서로 모여 서요 */
export const KIND_ORDER = ["개인", "외주", "실무", "클론"];
/** 구분마다 꼬리표·칩 색: 그 구분 비행기의 항공사 색이에요 (대한항공 하늘, 트리니티 로즈골드, 에어부산 남색, 제주항공 주황) */
export const KIND_COLOR: Record<string, string> = { "개인": "#2f8fd6", "외주": "#b9786a", "클론": "#f26a10", "실무": "#1d4f9e" };

const tagOf = (p: Project) => p.desc.match(/^\[(.+?)\]\s*/);
const kindOf = (p: Project) => KIND[tagOf(p)?.[1] ?? ""] ?? "개인";

/** 프로젝트를 출발편 정보(편명·구분·게이트·목적지 코드)로 바꿔요. */
export function toFlight(p: Project, i: number): Flight {
  const m = tagOf(p);
  return {
    ...p,
    flight: `KJ ${101 + i}`,
    kind: kindOf(p),
    body: m ? p.desc.slice(m[0].length) : p.desc,
    gate: `${p.category === "Desktop" ? "D" : "W"}${i + 1}`,
    dest: p.name.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase(),
  };
}

// 터미널, 구분끼리 모은 뒤 번호를 매겨서 편명·게이트도 이어져요
export const FLIGHTS: Flight[] = PROJECTS.toSorted((a, b) => (a.terminal ?? 1) - (b.terminal ?? 1) || KIND_ORDER.indexOf(kindOf(a)) - KIND_ORDER.indexOf(kindOf(b))).map(toFlight);

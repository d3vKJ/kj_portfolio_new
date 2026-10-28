import { PROJECTS, type Project } from "@/data/projects";

export type Flight = Project & { flight: string; kind: string; gate: string; body: string; dest: string };

const KIND: Record<string, string> = { "개인 프로젝트": "개인", "외주 작업": "외주", "클론 작업": "클론", "실무 도구": "실무" };
/** 계류장에 이 순서로 모여 서요 */
export const KIND_ORDER = ["개인", "외주", "실무", "클론"];
/** 구분마다 꼬리날개·칩 색 */
export const KIND_COLOR: Record<string, string> = { "개인": "#3182f6", "외주": "#fe9800", "클론": "#a234c7", "실무": "#03b26c" };

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

// 구분끼리 모은 뒤 번호를 매겨서 편명·게이트도 이어져요
export const FLIGHTS: Flight[] = PROJECTS.toSorted((a, b) => KIND_ORDER.indexOf(kindOf(a)) - KIND_ORDER.indexOf(kindOf(b))).map(toFlight);

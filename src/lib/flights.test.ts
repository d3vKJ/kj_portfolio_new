import { describe, expect, it } from "vitest";
import { FLIGHTS, KIND_ORDER, toFlight } from "./flights";
import type { Project } from "@/data/projects";

const base: Project = {
  name: "airport-typing", nameKo: "에어포트 타이핑", year: "2026", solo: true, category: "Web",
  desc: "[외주 작업] 설명이에요.", tech: [], techUsage: [], href: "https://example.com", code: null, image: null,
};

describe("toFlight", () => {
  it("편명은 KJ 101부터 순서대로 붙어요", () => {
    expect(toFlight(base, 0).flight).toBe("KJ 101");
    expect(toFlight(base, 4).flight).toBe("KJ 105");
  });

  it("설명 앞 [구분]을 떼어 구분과 본문으로 나눠요", () => {
    const f = toFlight(base, 0);
    expect(f.kind).toBe("외주");
    expect(f.body).toBe("설명이에요.");
  });

  it("구분이 없거나 모르는 값이면 개인으로 보고 설명은 그대로 둬요", () => {
    expect(toFlight({ ...base, desc: "그냥 설명" }, 0)).toMatchObject({ kind: "개인", body: "그냥 설명" });
    expect(toFlight({ ...base, desc: "[협업] 설명" }, 0).kind).toBe("개인");
  });

  it("게이트는 웹이면 W, 데스크톱이면 D예요", () => {
    expect(toFlight(base, 2).gate).toBe("W3");
    expect(toFlight({ ...base, category: "Desktop" }, 5).gate).toBe("D6");
  });

  it("목적지 코드는 이름의 영문 앞 세 글자예요", () => {
    expect(toFlight(base, 0).dest).toBe("AIR");
    expect(toFlight({ ...base, name: "youtube-music" }, 0).dest).toBe("YOU");
  });
});

describe("FLIGHTS", () => {
  it("모든 프로젝트가 구분을 제대로 읽혀요 (데이터 오타 방지)", () => {
    for (const f of FLIGHTS) {
      expect(["개인", "외주", "클론", "실무"]).toContain(f.kind);
      expect(f.body).not.toMatch(/^\[/);
    }
  });

  it("같은 구분끼리 모여 있고 편명은 그 순서대로 이어져요", () => {
    const ranks = FLIGHTS.map((f) => KIND_ORDER.indexOf(f.kind));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(FLIGHTS.map((f) => f.flight)).toEqual(FLIGHTS.map((_, i) => `KJ ${101 + i}`));
  });
});

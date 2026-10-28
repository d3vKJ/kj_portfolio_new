import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseProposal } from "./proposal";

const md = `# 테스트 기획안

머리말은 섹션 밖이라 무시해요.

## 1. 배경

첫 문단이에요.
둘째 문단이에요.

### 소제목

- 하나
- 둘

## 목표

- 셋
`;

describe("parseProposal", () => {
  const doc = parseProposal(md);

  it("제목과 섹션을 읽어요", () => {
    expect(doc.title).toBe("테스트 기획안");
    expect(doc.sections.map((s) => s.title)).toEqual(["배경", "목표"]);
  });

  it("번호가 있으면 두 자리 번호로, 없으면 순서대로 번호를 붙여요", () => {
    expect(doc.sections.map((s) => s.index)).toEqual(["01", "02"]);
    expect(doc.sections.map((s) => s.id)).toEqual(["proposal-section-1", "proposal-section-2"]);
  });

  it("문단, 소제목, 목록을 블록으로 나눠요", () => {
    expect(doc.sections[0].blocks).toEqual([
      { type: "p", text: "첫 문단이에요." },
      { type: "p", text: "둘째 문단이에요." },
      { type: "h3", text: "소제목" },
      { type: "ul", items: ["하나", "둘"] },
    ]);
    expect(doc.sections[1].blocks).toEqual([{ type: "ul", items: ["셋"] }]);
  });

  it("윈도우 줄바꿈(CRLF)도 똑같이 읽어요", () => {
    expect(parseProposal(md.replace(/\n/g, "\r\n"))).toEqual(doc);
  });

  it("실제 기획서 파일이 섹션 없이 비지 않아요", () => {
    for (const file of ["daimon", "youtube-music"]) {
      const parsed = parseProposal(readFileSync(`public/proposals/${file}.md`, "utf8"));
      expect(parsed.title).not.toBe("");
      expect(parsed.sections.length).toBeGreaterThan(0);
      expect(parsed.sections.every((s) => s.blocks.length > 0)).toBe(true);
    }
  });
});

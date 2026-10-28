import { describe, expect, it } from "vitest";
import { isHangul, sequence } from "./flap";

describe("sequence", () => {
  it("한글은 자모가 조립되며 끝나요", () => {
    for (const [ch, build] of [["장", ["ㅈ", "자", "장"]], ["경", ["ㄱ", "겨", "경"]], ["왜", ["ㅇ", "오", "왜"]]] as const) {
      const seq = sequence(ch, 0);
      expect(seq.slice(-build.length)).toEqual(build);
    }
  });

  it("한글은 조립 전에 자음만 넘겨요", () => {
    const seq = sequence("진", 2);
    const spins = seq.slice(0, -3);
    expect(spins.length).toBeGreaterThanOrEqual(2);
    expect(spins.every((c) => /^[ㄱ-ㅎ]$/.test(c))).toBe(true);
  });

  it("영문은 영문만, 숫자는 숫자만 넘기다 목표 글자에서 멈춰요", () => {
    const latin = sequence("K", 1);
    expect(latin.at(-1)).toBe("K");
    expect(latin.every((c) => /^[A-Z]$/.test(c))).toBe(true);

    const digit = sequence("7", 1);
    expect(digit.at(-1)).toBe("7");
    expect(digit.every((c) => /^\d$/.test(c))).toBe(true);
  });

  it("빈칸은 넘기지 않아요", () => {
    expect(sequence(" ", 3)).toEqual([" "]);
  });

  it("뒤쪽 칸일수록 더 오래 넘어가요", () => {
    const avg = (i: number) => Array.from({ length: 200 }, () => sequence("A", i).length).reduce((a, b) => a + b) / 200;
    expect(avg(8)).toBeGreaterThan(avg(0));
  });
});

describe("isHangul", () => {
  it("완성형 한글만 한글로 봐요", () => {
    expect(isHangul("가")).toBe(true);
    expect(isHangul("ㄱ")).toBe(false);
    expect(isHangul("A")).toBe(false);
  });
});

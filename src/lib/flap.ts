import { assemble, disassembleToGroups } from "es-hangul";

const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGIT = "0123456789";
const JAMO = "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ";
export const isHangul = (c: string) => /[가-힣]/.test(c);
const pick = (s: string) => s[Math.floor(Math.random() * s.length)];

/**
 * 한 칸이 넘어갈 글자 순서.
 * 한글은 자음 몇 장을 넘긴 뒤 자모가 조립되며 완성돼요 (ㅈ → 자 → 장).
 * 영문·숫자는 무작위로 몇 장 넘긴 뒤 멈춰요.
 */
export function sequence(target: string, index: number) {
  if (target === " ") return [" "];
  const spins = 2 + Math.floor(index * 1.2 + Math.random() * 3);
  if (isHangul(target)) {
    const jamo = disassembleToGroups(target)[0];
    const build = jamo.map((_, i) => assemble(jamo.slice(0, i + 1)));
    return [...Array.from({ length: spins }, () => pick(JAMO)), ...build];
  }
  const pool = /\d/.test(target) ? DIGIT : LATIN;
  return [...Array.from({ length: spins + 2 }, () => pick(pool)), target];
}

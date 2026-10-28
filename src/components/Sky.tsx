/**
 * 하늘빛 그라데이션 원 몇 개가 아주 느리게 떠다니는 배경.
 * 섹션에 isolate를 줘야 -z-10이 섹션 배경 위, 내용 아래에 깔려요.
 */
const ORBS = [
  { pos: "-left-[12%] -top-[18%] h-[60vw] w-[60vw]", color: "#cfe6ff", dur: "34s" },
  { pos: "-right-[14%] top-[20%] h-[50vw] w-[50vw]", color: "#d9f1ff", dur: "42s" },
  { pos: "bottom-[-25%] left-[30%] h-[45vw] w-[45vw]", color: "#e4e4ff", dur: "50s" },
];

export default function Sky() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {ORBS.map((o, i) => (
        <div
          key={i}
          className={`sky-orb absolute rounded-full ${o.pos}`}
          style={{ background: `radial-gradient(circle, ${o.color} 0%, transparent 68%)`, animationDuration: o.dur, animationDelay: `-${i * 9}s` }}
        />
      ))}
    </div>
  );
}

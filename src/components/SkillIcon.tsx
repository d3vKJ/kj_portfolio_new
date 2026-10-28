import Image from "next/image";
import { ICONS } from "@/data/skills";

/** 기술 로고. 밝은 배경(종이) 위에 놓일 때는 onPaper로 흰 로고를 검게 바꿔요. */
export default function SkillIcon({ name, size = 20, onPaper = false }: { name: string; size?: number; onPaper?: boolean }) {
  const info = ICONS[name];
  if (!info) return null;
  const invert = onPaper && info.light ? "invert" : "";
  if (info.svg) {
    return (
      <span
        className="inline-flex shrink-0"
        style={{ width: size, height: size, color: onPaper ? "#1d1f24" : undefined }}
        dangerouslySetInnerHTML={{ __html: info.svg.replace("<svg ", `<svg width="${size}" height="${size}" `) }}
      />
    );
  }
  return (
    <Image
      src={`https://cdn.simpleicons.org/${info.slug}/${info.color.replace("#", "")}`}
      width={size}
      height={size}
      alt=""
      unoptimized
      className={`shrink-0 object-contain ${invert}`}
    />
  );
}

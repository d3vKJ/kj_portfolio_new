"use client";

import Sky from "@/components/Sky";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import BoardingPass from "@/components/BoardingPass";
import { FLIGHTS, KIND_COLOR, KIND_ORDER, type Flight } from "@/lib/flights";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useDark } from "@/lib/theme";
import { isNarrow, useNarrow } from "@/lib/media";
import SkillIcon from "@/components/SkillIcon";
import ProposalModal from "@/components/ProposalModal";

// 인천공항처럼 터미널이 둘이에요: 1터미널은 일반 프로젝트, 2터미널은 게임 서버에서 만든 것.
// 새 프로젝트 자리: 2터미널에 실무 비행기 한 대를 미리 세워 둬요. 프로젝트를 넣으면 그 줄은 지워도 돼요.
type Slot = { f: Flight | null; kind: string };
const rank = (k: string) => KIND_ORDER.indexOf(k);
const slotsOf = (t: number): Slot[] => FLIGHTS.filter((f) => (f.terminal ?? 1) === t).map((f) => ({ f, kind: f.kind }));

// 계류장: 왼쪽부터 1터미널, 2터미널 탑승동이 나란히 서고 오른쪽 활주로를 같이 써요.
// 탑승동마다 양옆으로 비행기가 코를 대고 서 있어요.
const GAP = 3.6; // 게이트 사이 간격
const T_GAP = 3; // 두 탑승동 사이: 바깥 게이트끼리 GAP보다 멀어야 날개가 안 겹쳐요
const TERMINALS = [
  { name: "T1", slots: slotsOf(1) },
  { name: "T2", slots: [...slotsOf(2), { f: null, kind: "실무" }].sort((a, b) => rank(a.kind) - rank(b.kind)) },
].map((t) => ({ ...t, per: Math.ceil(t.slots.length / 2), len: Math.ceil(t.slots.length / 2) * GAP + 1.4, cx: 0 }));
TERMINALS.forEach((t, j) => (t.cx = j ? TERMINALS[j - 1].cx + TERMINALS[j - 1].len / 2 + T_GAP + t.len / 2 : 0));
const PIER_D = 1.5;
const NOSE_GAP = 0.55; // 탑승동과 비행기 코 사이
const HALF_LEN = 1.42; // 동체 길이의 반
const PLANE_Y = 0.62; // 바퀴 위 동체 가운데 높이
const AD = 2 * (PIER_D / 2 + NOSE_GAP + 2 * HALF_LEN + 2.6);
const TAXI = AD / 2 - 0.9; // 앞뒤 유도로
const LAST = TERMINALS[TERMINALS.length - 1];
const XT = LAST.cx + LAST.len / 2 + 2.1; // 활주로로 이어지는 세로 유도로
const RW = 2.4; // 활주로 폭
const XR = XT + 2.4; // 활주로 가운데
const X0 = -(TERMINALS[0].len / 2 + 3), X1 = XR + RW / 2 + 0.9; // 바닥 왼쪽·오른쪽 끝
const AW = X1 - X0;
const CX = (X0 + X1) / 2;

/** 모든 게이트: 터미널마다 앞줄(카메라 쪽)이 먼저, 뒷줄이 나중. 코(+z)가 탑승동을 봐요 */
const GATES = TERMINALS.flatMap(({ slots, per, cx }) => slots.map((slot, i) => {
  const side = i < per ? 1 : -1;
  return { ...slot, x: cx + ((i % per) - (per - 1) / 2) * GAP, z: side * (PIER_D / 2 + NOSE_GAP + HALF_LEN), side, yaw: side > 0 ? Math.PI : 0 };
}));

/** 꺾이는 점들을 지나되 모퉁이는 반지름 r로 둥글게 도는 길 */
function roundedPath(pts: THREE.Vector3[], r = 0.7) {
  const path = new THREE.CurvePath<THREE.Vector3>();
  let from = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    const c = pts[i];
    const a = c.clone().add(from.clone().sub(c).setLength(r));
    const b = c.clone().add(pts[i + 1].clone().sub(c).setLength(r));
    path.add(new THREE.LineCurve3(from, a));
    path.add(new THREE.QuadraticBezierCurve3(a, c, b));
    from = b;
  }
  path.add(new THREE.LineCurve3(from, pts[pts.length - 1]));
  return path;
}

const shape = (points: number[][]) => new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));

/** 2D 모양을 바닥에 눕혀 두께 h로 세워요: 모양의 y가 뒤쪽(-z)으로 가요 */
function flat(points: number[][], h: number) {
  return new THREE.ExtrudeGeometry(shape(points), { depth: h, bevelEnabled: false }).rotateX(-Math.PI / 2);
}

/** 2D 모양을 세로로 세워요: 모양의 x가 뒤쪽(-z), y가 위쪽 */
function upright(points: number[][], h: number) {
  return new THREE.ExtrudeGeometry(shape(points), { depth: h, bevelEnabled: false }).rotateY(Math.PI / 2).translate(-h / 2, 0, 0);
}

/** (반지름, z) 단면을 z축으로 돌려 깎아요 */
function lathe(profile: number[][], segments: number) {
  // 단면은 앞(+z)에서 뒤로 적지만, LatheGeometry는 아래에서 위로 받아야 면이 바깥을 봐요. 거꾸로면 안이 비쳐 보여요.
  return new THREE.LatheGeometry(profile.map(([r, z]) => new THREE.Vector2(r, z)).reverse(), segments).rotateX(Math.PI / 2);
}

/** 동체: 둥근 코, 긴 원통, 가늘어지는 꼬리. 꼬리는 위로 들리고 코는 살짝 숙여요. */
function fuselageGeometry() {
  const prof: number[][] = [];
  for (let j = 0; j <= 48; j++) {
    const z = HALF_LEN - (2 * HALF_LEN * j) / 48;
    const n = HALF_LEN - z, t = z + HALF_LEN; // 코·꼬리에서 떨어진 거리
    let r = 0.22;
    if (n < 0.5) r = 0.22 * Math.sqrt(1 - ((0.5 - n) / 0.5) ** 2);
    if (t < 0.95) r = Math.min(r, 0.035 + 0.185 * Math.sin(((t / 0.95) * Math.PI) / 2));
    prof.push([r, z]);
  }
  prof.push([0, -HALF_LEN]);
  const geo = lathe(prof, 32);
  const pos = geo.attributes.position;
  for (let v = 0; v < pos.count; v++) {
    const z = pos.getZ(v);
    pos.setY(v, pos.getY(v) + Math.max(0, -0.45 - z) * 0.17 - Math.max(0, z - 0.9) * 0.08);
  }
  return geo;
}

/** 바닥 도색: 회색 계류장에 노란 유도선, 게이트 번호, 오른쪽 활주로. 밤에는 아스팔트가 어두워요. */
function apronTexture(dark: boolean) {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = Math.round((2048 * AD) / AW);
  const g = c.getContext("2d")!;
  const k = c.width / AW;
  g.scale(k, k);
  g.translate(-X0, AD / 2); // 이제 (x, z) 그대로 그려요
  g.fillStyle = dark ? "#2a2b32" : "#e3e7ec";
  g.beginPath();
  g.roundRect(X0, -AD / 2, AW, AD, 1.2);
  g.fill();

  // 활주로: 진한 회색 띠에 흰 테두리선, 가운데 점선, 양 끝 줄무늬
  const top = -AD / 2 + 0.3, len = AD - 0.6;
  g.fillStyle = dark ? "#1f2026" : "#c3cad3";
  g.fillRect(XR - RW / 2, top, RW, len);
  g.fillStyle = dark ? "#8a8d96" : "#fff";
  for (const s of [-1, 1]) g.fillRect(XR + s * (RW / 2 - 0.12) - 0.03, top + 0.2, 0.06, len - 0.4);
  for (let z = top + 1.9; z < top + len - 1.4; z += 0.9) g.fillRect(XR - 0.04, z, 0.08, 0.48);
  for (const zz of [top + 0.35, top + len - 1.15]) for (let s = -0.8; s <= 0.81; s += 0.2) g.fillRect(XR + s - 0.06, zz, 0.12, 0.8);

  g.strokeStyle = "#ffc342";
  g.lineCap = "round";
  g.lineJoin = "round";
  g.lineWidth = 0.08;
  g.beginPath(); // 앞 유도로 → 세로 유도로 → 뒤 유도로 → 활주로
  g.moveTo(X0 + 0.9, TAXI);
  g.lineTo(XT, TAXI);
  g.lineTo(XT, -TAXI);
  g.lineTo(XR, -TAXI);
  g.moveTo(X0 + 0.9, -TAXI);
  g.lineTo(XT, -TAXI);
  g.stroke();

  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "700 0.5px Pretendard, system-ui, sans-serif";
  GATES.forEach(({ f, x, side }) => {
    const edge = side * (PIER_D / 2);
    g.lineWidth = 0.06;
    g.beginPath();
    g.moveTo(x, edge + side * 0.2);
    g.lineTo(x, side * TAXI);
    g.stroke();
    g.lineWidth = 0.1;
    g.beginPath();
    g.moveTo(x - 0.35, edge + side * 0.35);
    g.lineTo(x + 0.35, edge + side * 0.35);
    g.stroke();
    g.fillStyle = "#8b95a1";
    if (f) g.fillText(f.gate, x - 0.9, side * (TAXI - 0.7)); // 꼬리 뒤에 써야 꼬리표에 안 가려요
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** 구분마다 항공사 도색: 로고 대신 색과 태극 같은 무늬만 따 왔어요.
 *  line은 윗동체·아랫동체 경계 높이(-1~1), stripe는 경계의 줄, bellyRear는 배 뒤쪽 절반 색이에요. */
type Livery = { top: string; belly: string; line: number; stripe?: string; bellyRear?: string; engine: string; fin: (g: CanvasRenderingContext2D) => void };
const LIVERY: Record<string, Livery> = {
  // 대한항공: 하늘색 윗동체와 은회색 아랫동체 사이에 회색 줄, 꼬리도 하늘색에 태극
  개인: {
    top: "#8cc6e8", belly: "#c5ccd4", line: -0.15, stripe: "#8b95a1", engine: "#8cc6e8",
    fin: (g) => {
      g.fillStyle = "#8cc6e8";
      g.fillRect(0, 0, 1, 1);
      const cx = 0.6, cy = 0.56, r = 0.13;
      const disc = (c: string, x: number, rr: number, a0 = 0, a1 = Math.PI * 2) => (g.fillStyle = c, g.beginPath(), g.arc(x, cy, rr, a0, a1), g.fill());
      disc("#cd2e3a", cx, r, 0, Math.PI); // 위는 빨강(이 판은 y가 위)
      disc("#0047a0", cx, r, Math.PI, Math.PI * 2);
      disc("#cd2e3a", cx - r / 2, r / 2); // 두 작은 원이 S자 경계를 만들어요
      disc("#0047a0", cx + r / 2, r / 2);
    },
  },
  // 트리니티항공: 흰 동체에 회색 배, 회색 꼬리에 분홍·노랑·파랑 삼각형
  외주: {
    top: "#fbfcfd", belly: "#6b727c", line: -0.35, stripe: "#8b95a1", engine: "#6b727c",
    fin: (g) => {
      g.fillStyle = "#5c636d";
      g.fillRect(0, 0, 1, 1);
      const tri = (c: string, p: number[]) => (g.fillStyle = c, g.beginPath(), g.moveTo(p[0], p[1]), g.lineTo(p[2], p[3]), g.lineTo(p[4], p[5]), g.fill());
      tri("#f2a7b8", [0.3, 0.3, 0.52, 0.3, 0.41, 0.49]);
      tri("#f4c95d", [0.41, 0.49, 0.52, 0.3, 0.63, 0.49]);
      tri("#8fb4e0", [0.52, 0.68, 0.41, 0.49, 0.63, 0.49]);
    },
  },
  // 에어부산: 흰 동체에 배는 앞 절반 남색·뒤 절반 연두, 남색 꼬리에 하늘색·흰 물결
  실무: {
    top: "#fbfcfd", belly: "#123f8c", bellyRear: "#a6ce39", line: -0.35, engine: "#123f8c",
    fin: (g) => {
      g.fillStyle = "#123f8c";
      g.fillRect(0, 0, 1, 1);
      g.lineCap = "round";
      ([["#5ec2f0", 0.07, 0.42], ["#fbfcfd", 0.035, 0.56]] as const).forEach(([c, w, y]) => {
        g.strokeStyle = c;
        g.lineWidth = w;
        g.beginPath(); // 앞 아래에서 뒤 위로 휘어 오르는 물결
        g.moveTo(0.2, y - 0.12);
        g.quadraticCurveTo(0.5, y + 0.1, 0.9, y + 0.05);
        g.stroke();
      });
    },
  },
  // 제주항공: 흰 동체에 주황 배, 주황 꼬리·엔진
  클론: {
    top: "#fbfcfd", belly: "#ff6c0e", line: -0.35, engine: "#ff6c0e",
    fin: (g) => {
      g.fillStyle = "#ff6c0e";
      g.fillRect(0, 0, 1, 1);
      g.fillStyle = "#ffa04d"; // 꼬리 아래쪽에 밝은 주황 쐐기
      g.beginPath();
      g.moveTo(0, 0); g.lineTo(1, 0); g.lineTo(1, 0.3); g.lineTo(0, 0.12);
      g.fill();
    },
  },
};

/** 동체 도색: 선반 UV의 u가 둘레를, v가 꼬리(0)에서 코(1)까지 가요. 높이(-cos)로 윗동체·아랫동체를 나눠요. */
function bodyTexture({ top, belly, line, stripe, bellyRear = belly }: Livery) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 64; // 위 절반이 앞(코), 아래 절반이 뒤. 두 줄만 두면 사이가 번져서 넉넉히 둬요.
  const g = c.getContext("2d")!;
  for (let px = 0; px < 512; px++) {
    const y = -Math.cos((2 * Math.PI * (px + 0.5)) / 512);
    const band = stripe && y >= line && y <= line + 0.08;
    g.fillStyle = band ? stripe : y > line ? top : belly;
    g.fillRect(px, 0, 1, 32);
    g.fillStyle = band ? stripe : y > line ? top : bellyRear;
    g.fillRect(px, 32, 1, 32);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 꼬리날개 도색: 모양 좌표(뒤쪽 x, 위 y, 0~0.8)에 그대로 그려요 */
function finTexture(draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.translate(0, 256);
  g.scale(256, -256); // 이제 0~1, 위가 +y
  draw(g);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(1 / 0.8, 1 / 0.8);
  tex.anisotropy = 4;
  return tex;
}

/** 비행기 위 꼬리표: 진짜 글자(HTML)로 그려야 어느 화면에서도 또렷해요 */
function tagElement(top: string, name: string, color: string, clickable: boolean) {
  // 바깥 칸은 자리만 잡고, 크기는 안쪽 카드에 줘요. 바깥에 scale을 주면 위치 이동까지 같이 커져요.
  const box = document.createElement("div");
  const el = document.createElement("div");
  el.className = `${clickable ? "pointer-events-auto cursor-pointer" : ""} select-none whitespace-nowrap rounded-xl border border-l-[6px] border-line bg-card py-1.5 pl-3 pr-4 shadow-[0_6px_16px_-8px_rgba(0,29,58,.35)] [transform-origin:50%_100%]`;
  el.style.borderLeftColor = color;
  box.append(el);
  const t = document.createElement("p");
  t.className = "text-[11px] font-semibold leading-4 text-muted";
  t.textContent = top;
  const n = document.createElement("p");
  n.className = "text-[15px] font-bold leading-5 text-ink max-sm:text-[13px]";
  n.textContent = name;
  el.append(t, n);
  return box;
}

/** 지붕 글자 획: 글자 높이 1 기준 윤곽과 글자 너비. 글꼴 파일 없이 T, 1, 2만 그려요 */
const GLYPHS: Record<string, { w: number; shape: () => THREE.Shape }> = {
  T: { w: 0.8, shape: () => shape([[0, 1], [0.8, 1], [0.8, 0.78], [0.51, 0.78], [0.51, 0], [0.29, 0], [0.29, 0.78], [0, 0.78]]) },
  "1": { w: 0.46, shape: () => shape([[0.04, 0.52], [0.04, 0.8], [0.24, 1], [0.46, 1], [0.46, 0], [0.24, 0], [0.24, 0.72]]) },
  "2": {
    w: 0.66,
    shape: () => {
      const d = Math.PI / 180;
      const g = new THREE.Shape();
      g.moveTo(0, 0);
      g.lineTo(0.66, 0);
      g.lineTo(0.66, 0.2);
      g.lineTo(0.32, 0.2);
      g.absarc(0.33, 0.68, 0.32, -40 * d, 165 * d, false); // 바깥 고리
      g.absarc(0.33, 0.68, 0.12, 165 * d, -40 * d, true); // 안쪽 고리
      g.lineTo(0, 0.2);
      return g;
    },
  },
};

/** 지붕에 눕힌 글자: 가운데가 원점, 위로 h만큼 솟아요. 글자 위쪽이 뒤(-z)를 봐요 */
function roofText(text: string, size: number, h: number) {
  const shapes: THREE.Shape[] = [];
  let x = 0;
  for (const ch of text) {
    const sh = GLYPHS[ch].shape();
    shapes.push(new THREE.Shape(sh.extractPoints(24).shape.map((v) => v.add(new THREE.Vector2(x, 0)))));
    x += GLYPHS[ch].w + 0.12;
  }
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: h / size, bevelEnabled: false }).rotateX(-Math.PI / 2).scale(size, size, size);
  geo.center();
  return geo.translate(0, h / 2, 0);
}

/** 프로젝트 목록: 계류장 게이트마다 프로젝트 비행기가 서 있어요. 누르면 활주로로 가서 이륙해 화면으로 날아오고, 탑승권이 열려요. */
/** 폰 전용: 계류장 대신 한눈에 보는 프로젝트 카드 */
function ProjectCards() {
  const [proposal, setProposal] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement>(null);
  return (
    <>
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:hidden">
      {FLIGHTS.map((f) => (
        <li key={f.name} className="overflow-hidden rounded-3xl bg-surface">
          {f.image && <img src={f.image} alt={`${f.nameKo} 화면`} loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover object-top" />}
          <div className="p-5">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
              <span className="rounded-full px-2.5 py-0.5 font-semibold" style={{ color: KIND_COLOR[f.kind], background: `color-mix(in srgb, ${KIND_COLOR[f.kind]} 14%, transparent)` }}>{f.kind}</span>
              {f.category === "Desktop" ? "데스크톱 앱" : "웹"} · {f.year}
            </p>
            <h3 className="mt-2 text-[22px] font-bold leading-tight">{f.nameKo}</h3>
            <p className="mt-2 text-[15px] leading-7 text-sub">{f.body}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {f.tech.map((t) => (
                <li key={t} className="flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1 text-[13px] font-medium"><SkillIcon name={t} size={14} onPaper />{t}</li>
              ))}
            </ul>
            {!f.code && f.codeNote && <p className="mt-4 text-[13px] leading-6 text-muted">{f.codeNote}</p>}
            <div className="mt-5 flex flex-wrap gap-2 *:h-11 *:min-w-[7.5rem] *:flex-1 *:justify-center">
              {f.href === "/" ? (
                <a href="#top" className="btn">지금 이 사이트</a>
              ) : (
                <a href={f.href} target="_blank" rel="noreferrer" className="btn">사이트 보기 <span className="arr" aria-hidden>→</span></a>
              )}
              {f.code && <a href={f.code} target="_blank" rel="noreferrer" className="btn-line">코드 보기</a>}
              {f.proposal && <button type="button" onClick={(e) => { opener.current = e.currentTarget; setProposal(f.proposal!); }} className="btn-line">기획서 보기</button>}
            </div>
          </div>
        </li>
      ))}
    </ul>
    {proposal && <ProposalModal open src={proposal} onClose={() => setProposal(null)} returnFocusRef={opener} />}
    </>
  );
}

export default function Departures() {
  const root = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [noGL, setNoGL] = useState(false);
  const [pass, setPass] = useState<Flight | null>(null);
  const api = useRef<{ land(): void } | null>(null);
  const dark = useDark();
  const narrow = useNarrow();
  const arrived = useRef(false); // 테마를 바꿔 장면을 다시 만들 때 들어오는 장면을 또 보여 주지 않아요

  useGSAP(() => {
    gsap.from("[data-head] > *", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 60%" } });
  }, { scope: root });

  useEffect(() => {
    if (isNarrow()) return; // 폰은 계류장 없이 카드만 보여 줘요
    const el = host.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setNoGL(true); // WebGL이 없으면 목록으로 보여 줘요
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.NeutralToneMapping;
    el.appendChild(renderer.domElement);
    const labels = new CSS2DRenderer(); // 꼬리표는 캔버스 위에 HTML로 얹어요
    labels.domElement.className = "pointer-events-none absolute inset-0";
    el.appendChild(labels.domElement);
    let labelHover = -1;

    const scene = new THREE.Scene();
    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const world = new THREE.Group(); // 세로 화면에서 돌리는 판
    const site = new THREE.Group(); // 바닥 가운데가 world 가운데에 오게 옮긴 판
    site.position.x = -CX;
    world.add(site);
    scene.add(world);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    scene.environment = track(pmrem.fromScene(room, 0.04).texture);
    scene.environmentIntensity = dark ? 0.2 : 0.45;
    room.dispose();
    pmrem.dispose();
    // 밤에는 푸르스름한 달빛으로 어둡게 비춰요
    scene.add(dark ? new THREE.HemisphereLight(0x9fb4d8, 0x22252c, 0.45) : new THREE.HemisphereLight(0xffffff, 0xc9d3df, 0.7));
    const sun = new THREE.DirectionalLight(dark ? 0xc4d2ee : 0xffffff, dark ? 0.9 : 2.2);
    sun.position.set(-6, 12, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0005;
    Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17 });
    scene.add(sun);

    const mat = (color: string, rough = 0.6, metal = 0) => track(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }));
    const put = (geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = site) => {
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(x, y, z);
      mesh.castShadow = mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // 바닥 도색
    const apron = new THREE.Mesh(track(new THREE.PlaneGeometry(AW, AD).rotateX(-Math.PI / 2)), track(new THREE.MeshStandardMaterial({ map: track(apronTexture(dark)), transparent: true, roughness: 0.95 })));
    apron.position.x = CX;
    apron.receiveShadow = true;
    site.add(apron);

    // 탑승동: 콘크리트 기단 위 흰 건물, 세로 창살이 선 유리벽, 처마가 나온 지붕과 옥상 설비, 지붕에 T1·T2
    const white = mat("#f9fafb", 0.5);
    const glass = mat("#9fc3ea", 0.15, 0.3);
    if (dark) glass.emissive.set("#ffcf7a"), (glass.emissiveIntensity = 0.55); // 밤에는 터미널 창에 불이 켜져요
    const steel = mat("#d1d6db", 0.4, 0.5);
    const trim = mat("#6b7684", 0.4, 0.6);
    const concrete = mat(dark ? "#3a3d45" : "#c9cfd6", 0.9);
    const letter = mat("#8b95a1", 0.6); // 낮이든 밤이든 회색
    const ROOF = 0.92; // 지붕 윗면 높이
    const mullionGeo = track(new THREE.BoxGeometry(0.018, 0.42, 0.02));
    const unitGeo = track(new RoundedBoxGeometry(0.34, 0.1, 0.24, 2, 0.02));
    const signs = TERMINALS.map((t) => {
      put(track(new THREE.BoxGeometry(t.len + 0.12, 0.06, PIER_D + 0.12)), concrete, t.cx, 0.03, 0);
      put(track(new RoundedBoxGeometry(t.len, 0.78, PIER_D, 3, 0.06)), white, t.cx, 0.45, 0);
      put(track(new THREE.BoxGeometry(t.len - 0.2, 0.42, PIER_D + 0.02)), glass, t.cx, 0.5, 0);
      const n = Math.floor((t.len - 0.2) / 0.3) + 1;
      const mullions = new THREE.InstancedMesh(mullionGeo, steel, n * 2);
      const at = new THREE.Matrix4();
      for (let m = 0; m < n * 2; m++) mullions.setMatrixAt(m, at.makeTranslation(t.cx - (t.len - 0.2) / 2 + (m % n) * 0.3, 0.5, (m < n ? 1 : -1) * (PIER_D / 2 + 0.012)));
      site.add(mullions);
      put(track(new THREE.BoxGeometry(t.len + 0.26, 0.03, PIER_D + 0.32)), trim, t.cx, 0.85, 0); // 처마 밑 띠
      put(track(new RoundedBoxGeometry(t.len + 0.24, 0.07, PIER_D + 0.3, 2, 0.025)), white, t.cx, ROOF - 0.035, 0);
      for (const s of [-1, 1]) put(unitGeo, steel, t.cx + s * (t.len / 2 - 0.5), ROOF + 0.05, -0.38);
      return put(track(roofText(t.name, 0.8, 0.07)), letter, t.cx, ROOF, 0);
    });

    // 관제탑: 아래가 넓고 위로 갈수록 가늘다가 꼭대기에서 벌어지는 기둥, 바깥으로 기운 유리 관제실, 안테나와 빨간 항공등
    const tower = new THREE.Group();
    tower.position.set(-(TERMINALS[0].len / 2 + 1.1), 0, 0);
    site.add(tower);
    put(track(new THREE.CylinderGeometry(0.46, 0.5, 0.08, 32)), concrete, 0, 0.04, 0, tower);
    const shaft = [[0.3, 0.08], [0.25, 0.4], [0.19, 1.3], [0.19, 1.9], [0.26, 2.12], [0.42, 2.26]];
    put(track(new THREE.LatheGeometry(shaft.map(([r, y]) => new THREE.Vector2(r, y)), 40)), white, 0, 0, 0, tower);
    for (const y of [0.9, 1.5]) put(track(new THREE.CylinderGeometry(0.205, 0.205, 0.04, 32)), trim, 0, y, 0, tower);
    put(track(new THREE.CylinderGeometry(0.46, 0.43, 0.06, 32)), white, 0, 2.29, 0, tower);
    const CAB = { y: 2.5, h: 0.36, r0: 0.42, r1: 0.52, sides: 12 };
    put(track(new THREE.CylinderGeometry(CAB.r1, CAB.r0, CAB.h, CAB.sides)), glass, 0, CAB.y, 0, tower);
    const tilt = Math.atan((CAB.r1 - CAB.r0) / CAB.h);
    const cabMullionGeo = track(new THREE.BoxGeometry(0.02, CAB.h / Math.cos(tilt), 0.02));
    for (let k = 0; k < CAB.sides; k++) {
      const g = new THREE.Group();
      g.rotation.y = (k / CAB.sides) * Math.PI * 2;
      put(cabMullionGeo, trim, 0, CAB.y, (CAB.r0 + CAB.r1) / 2 + 0.005, g).rotation.x = tilt;
      tower.add(g);
    }
    put(track(new THREE.CylinderGeometry(0.56, 0.52, 0.06, 32)), white, 0, CAB.y + CAB.h / 2 + 0.03, 0, tower);
    put(track(new THREE.CylinderGeometry(0.26, 0.32, 0.14, 24)), steel, 0, CAB.y + CAB.h / 2 + 0.13, 0, tower);
    put(track(new THREE.CylinderGeometry(0.012, 0.016, 0.5, 8)), trim, 0, CAB.y + CAB.h / 2 + 0.45, 0, tower);
    put(track(new THREE.SphereGeometry(0.03, 12, 10)), track(new THREE.MeshBasicMaterial({ color: "#ff3b4a" })), 0, CAB.y + CAB.h / 2 + 0.72, 0, tower);

    // 등불이 번지는 빛: 가운데가 하얗고 바깥으로 흐려지는 동그라미
    const dot = document.createElement("canvas");
    dot.width = dot.height = 64;
    const dg = dot.getContext("2d")!;
    const grad = dg.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.2, "rgba(255,255,255,.9)");
    grad.addColorStop(0.45, "rgba(255,255,255,.35)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    dg.fillStyle = grad;
    dg.fillRect(0, 0, 64, 64);
    const glow = track(new THREE.CanvasTexture(dot));

    // 밤에만 활주로 불: 양옆 흰 등, 가운데 등, 들어오는 끝은 초록·나가는 끝은 빨강. 번지는 빛 점(Points)으로 그려요.
    if (dark) {
      const pts: number[] = [], cols: number[] = [];
      const add = (x: number, z: number, hex: string) => {
        const c = new THREE.Color(hex);
        pts.push(x, 0.04, z);
        cols.push(c.r, c.g, c.b);
      };
      const top = -AD / 2 + 0.3, len = AD - 0.6;
      for (let z = top + 0.3; z <= top + len - 0.3; z += 0.55) for (const sx of [-1, 1]) add(XR + sx * (RW / 2 - 0.05), z, "#fff2c6");
      for (let z = top + 0.9; z <= top + len - 0.9; z += 0.45) add(XR, z, "#dfe9ff");
      for (let x = -RW / 2 + 0.1; x <= RW / 2 - 0.09; x += 0.2) (add(XR + x, top + 0.1, "#3ee07a"), add(XR + x, top + len - 0.1, "#ff4d5a"));
      const geo = track(new THREE.BufferGeometry());
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
      const lights = new THREE.Points(geo, track(new THREE.PointsMaterial({ size: 0.45, map: glow, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
      site.add(lights);
    }

    // 탑승교: 탑승동에서 비행기 문 옆까지
    const bridgeLen = NOSE_GAP + 0.45;
    const bridgeGeo = track(new RoundedBoxGeometry(0.3, 0.28, bridgeLen, 2, 0.05));
    GATES.forEach(({ x, side }) => {
      put(bridgeGeo, steel, x - side * 0.38, PLANE_Y, side * (PIER_D / 2 + bridgeLen / 2));
    });

    // 비행기 부품: 모양은 같이 쓰고 재질만 비행기마다 따로 둬서 하나씩 흐리게 할 수 있어요
    const DIHEDRAL = 0.07; // 날개가 위로 살짝 들린 각
    const fuselageGeo = track(fuselageGeometry());
    const wingGeo = [1, -1].map((s) => track(flat([[0, -0.35], [s * 1.6, 0.5], [s * 1.6, 0.7], [0, 0.55]], 0.045)));
    const stabGeo = [1, -1].map((s) => track(flat([[0, -0.1], [s * 0.66, 0.25], [s * 0.66, 0.38], [0, 0.24]], 0.035)));
    const finGeo = track(upright([[0, 0], [0.5, 0], [0.72, 0.78], [0.52, 0.78]], 0.04));
    const wingletGeo = track(upright([[0, 0], [0.2, 0], [0.26, 0.22], [0.16, 0.22]], 0.025));
    const nacelleGeo = track(lathe([[0, 0.27], [0.095, 0.27], [0.112, 0.2], [0.11, 0], [0.08, -0.2], [0.04, -0.25], [0, -0.25]], 20));
    const intakeGeo = track(new THREE.CircleGeometry(0.09, 20));
    const pylonGeo = track(new THREE.BoxGeometry(0.035, 0.08, 0.3));
    const windowGeo = track(new THREE.BoxGeometry(0.016, 0.03, 0.024));
    const cockpitGeo = track(new THREE.BoxGeometry(0.1, 0.014, 0.075));
    const strutGeo = track(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 8).translate(0, -0.225, 0));
    const wheelGeo = [0.07, 0.055].map((r) => track(new THREE.CylinderGeometry(r, r, 0.045, 16).rotateZ(Math.PI / 2)));
    // 날개 끝 등: 진짜 비행기처럼 왼쪽(+x, 코가 +z라서) 빨강, 오른쪽 초록. 모든 비행기가 재질을 같이 써서 같은 박자로 깜빡여요.
    const beaconGeo = track(new THREE.SphereGeometry(0.028, 10, 8));
    const beaconMats = ["#ff3b4a", "#1fdc6a"].map((color) => track(new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false })));
    const haloMats = ["#ff3b4a", "#1fdc6a"].map((color) => track(new THREE.SpriteMaterial({ map: glow, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
    // 밤에는 창문에 불이 켜져요: 비행기마다 흐려지기도 해서 재질은 비행기마다 따로 만들어요
    const windowLit = () => track(new THREE.MeshStandardMaterial({ color: "#ffe6ad", emissive: "#ffc861", emissiveIntensity: 1.1, roughness: 0.4, transparent: true }));
    const dummy = new THREE.Object3D();

    const pickables: THREE.Object3D[] = [];
    const planes = GATES.map(({ f, kind, x, z, side, yaw }, i) => {
      const color = KIND_COLOR[kind];
      const physical = (c: string, rough: number) => track(new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, clearcoat: 0.8, clearcoatRoughness: 0.2, transparent: true }));
      const lv = LIVERY[kind];
      const bodyMat = physical("#fbfcfd", 0.35);
      const paintMat = physical(lv.engine, 0.38);
      const skinMat = physical("#ffffff", 0.35);
      skinMat.map = track(bodyTexture(lv));
      const finMat = physical("#ffffff", 0.38);
      finMat.map = track(finTexture(lv.fin));
      const darkMat = track(new THREE.MeshStandardMaterial({ color: "#1f2733", roughness: 0.3, metalness: 0.2, transparent: true }));
      const gearMat = track(new THREE.MeshStandardMaterial({ color: "#8b95a1", roughness: 0.4, metalness: 0.6, transparent: true }));
      const plane = new THREE.Group();
      put(fuselageGeo, skinMat, 0, 0, 0, plane);
      [1, -1].forEach((s, j) => {
        put(wingGeo[j], bodyMat, 0, -0.13, 0.15, plane).rotation.z = s * DIHEDRAL;
        put(stabGeo[j], bodyMat, 0, 0.12, -1.1, plane).rotation.z = s * 0.12;
        put(wingletGeo, paintMat, s * 1.595, -0.13 + 1.6 * DIHEDRAL, -0.35, plane);
        // 엔진: 날개 앞쪽 아래에 걸린 통, 앞은 어두운 흡입구
        const ex = s * 0.62, ey = -0.25, ez = 0.32;
        put(nacelleGeo, paintMat, ex, ey, ez, plane);
        put(intakeGeo, darkMat, ex, ey, ez + 0.272, plane);
        put(pylonGeo, bodyMat, ex, -0.12, 0.2, plane);
        // 조종석 앞 유리
        put(cockpitGeo, darkMat, s * 0.125, 0.148, 1.07, plane).rotation.z = -s * 0.66;
      });
      put(finGeo, finMat, 0, 0.2, -0.75, plane);
      // 객실 창문: 양옆에 한 줄씩
      const windowMat = dark ? windowLit() : darkMat;
      const windows = new THREE.InstancedMesh(windowGeo, windowMat, 28);
      for (let w = 0; w < 28; w++) {
        dummy.position.set((w < 14 ? 1 : -1) * 0.208, 0.075, 0.78 - (w % 14) * 0.105);
        dummy.updateMatrix();
        windows.setMatrixAt(w, dummy.matrix);
      }
      plane.add(windows);
      // 바퀴: 앞바퀴는 앞으로, 뒷바퀴는 안쪽으로 접혀 들어가요
      const gears = ([[0, 1.0, 1, "x", -1], [0.28, 0, 0, "z", -1], [-0.28, 0, 0, "z", 1]] as const).map(([x, z, w, axis, sign]) => {
        const g = new THREE.Group();
        g.position.set(x, -0.12, z);
        put(strutGeo, gearMat, 0, 0, 0, g);
        const r = w ? 0.055 : 0.07;
        for (const s of [-1, 1]) put(wheelGeo[w], darkMat, s * 0.035, -(PLANE_Y - 0.12 - r), 0, g);
        plane.add(g);
        return { g, axis, sign };
      });
      for (const [j, s] of [1, -1].entries()) {
        const beacon = new THREE.Mesh(beaconGeo, beaconMats[j]);
        const halo = new THREE.Sprite(haloMats[j]); // 등 둘레로 번지는 빛
        halo.scale.setScalar(dark ? 0.4 : 0.22);
        beacon.add(halo);
        beacon.position.set(s * 1.6, -0.13 + 1.6 * DIHEDRAL + 0.03, -0.37); // 윙렛 앞 끝
        plane.add(beacon);
      }

      const tag = new CSS2DObject(f ? tagElement(`${f.flight} · ${f.gate}`, f.nameKo, color, true) : tagElement("곧 출발", "새 프로젝트 준비 중", color, false));
      tag.center.set(0.5, 1); // 아래 가운데를 비행기 위에 걸어요
      if (f) { // 준비 중인 비행기는 누를 수 없어요
        plane.traverse((o) => (o.userData.i = i, o instanceof THREE.Mesh && !beaconMats.includes(o.material) && pickables.push(o)));
        tag.element.addEventListener("pointerenter", () => (labelHover = i));
        tag.element.addEventListener("pointerleave", () => (labelHover = -1));
        tag.element.addEventListener("click", (e) => {
          e.stopPropagation(); // 캔버스 클릭으로 한 번 더 잡히지 않게
          if (flight) flight.progress(1);
          else if (planes[i].arrive === 1 && !planes[i].flying) takeOff(i);
        });
      }
      const holder = new THREE.Group();
      const gate = { x, z, side, yaw };
      holder.rotation.y = gate.yaw;
      holder.add(plane, tag);
      site.add(holder);
      return { f, gate, holder, plane, tag, gears, mats: [...new Set([bodyMat, paintMat, skinMat, finMat, darkMat, gearMat, windowMat])], arrive: reduce || arrived.current ? 1 : 0, lift: 0, alpha: 1, flying: false };
    });
    type Plane = (typeof planes)[number];

    // 토잉카: 낮은 노란 차체, 뒤쪽 운전석과 지붕 경광등, 앞뒤 범퍼. 앞(+z)이 비행기 반대쪽이에요.
    // 견인봉은 차 앞 고리(관절)에 걸려 위아래·좌우로 꺾이고, 끝의 집게가 비행기 앞바퀴를 물어요.
    const tug = new THREE.Group();
    const TUG_Z = 1.78; // 비행기 가운데에서 토잉카 가운데까지
    const yellow = mat("#ffc342", 0.45);
    const black = mat("#1f2733", 0.6);
    const metal = mat("#8b95a1", 0.35, 0.7);
    put(track(new RoundedBoxGeometry(0.46, 0.11, 0.66, 2, 0.035)), yellow, 0, 0.13, 0, tug);
    put(track(new RoundedBoxGeometry(0.4, 0.05, 0.3, 2, 0.02)), yellow, 0, 0.2, -0.12, tug); // 앞쪽 엔진 덮개
    for (const bz of [-0.35, 0.35]) put(track(new RoundedBoxGeometry(0.48, 0.05, 0.05, 2, 0.02)), black, 0, 0.1, bz, tug);
    // 운전석: 기둥 네 개에 지붕, 안에 어두운 유리
    put(track(new THREE.BoxGeometry(0.28, 0.12, 0.16)), mat("#33415a", 0.15, 0.3), 0, 0.25, 0.18, tug);
    const pillarGeo = track(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6));
    for (const px of [-0.15, 0.15]) for (const pz of [0.09, 0.27]) put(pillarGeo, black, px, 0.27, pz, tug);
    put(track(new RoundedBoxGeometry(0.34, 0.022, 0.22, 2, 0.01)), yellow, 0, 0.36, 0.18, tug);
    const tugBeacon = new THREE.Mesh(track(new THREE.SphereGeometry(0.025, 10, 8)), track(new THREE.MeshBasicMaterial({ color: "#ff9f1a" })));
    tugBeacon.position.set(0, 0.385, 0.18);
    tug.add(tugBeacon);
    // 바퀴: 타이어에 은색 휠. 앞바퀴(비행기 쪽)는 돌아갈 때 꺾여요.
    const tireGeo = track(new THREE.CylinderGeometry(0.07, 0.07, 0.065, 16).rotateZ(Math.PI / 2));
    const hubGeo = track(new THREE.CylinderGeometry(0.038, 0.038, 0.07, 12).rotateZ(Math.PI / 2));
    const steer: THREE.Group[] = [];
    for (const wz of [-0.21, 0.21]) for (const wx of [-0.24, 0.24]) {
      const w = new THREE.Group();
      w.position.set(wx, 0.07, wz);
      put(tireGeo, black, 0, 0, 0, w);
      put(hubGeo, metal, Math.sign(wx) * 0.002, 0, 0, w);
      tug.add(w);
      if (wz < 0) steer.push(w);
    }
    // 견인봉: 고리 관절 → 봉 → 집게 관절
    const HITCH = new THREE.Vector3(0, 0.09, -0.36);
    const jointGeo = track(new THREE.SphereGeometry(0.026, 12, 10));
    put(jointGeo, metal, HITCH.x, HITCH.y, HITCH.z, tug);
    const bar = new THREE.Group(); // 고리에서 꺾이는 봉
    bar.position.copy(HITCH);
    tug.add(bar);
    const barLen = TUG_Z + HITCH.z - 1.0; // 앞바퀴(z=1.0)까지
    put(track(new THREE.CylinderGeometry(0.016, 0.016, barLen, 8).rotateX(Math.PI / 2).translate(0, 0, -barLen / 2)), mat("#f04452", 0.4), 0, 0, 0, bar);
    put(jointGeo, metal, 0, 0, -barLen, bar);
    put(track(new THREE.BoxGeometry(0.1, 0.03, 0.04)), metal, 0, 0, -barLen - 0.01, bar); // 앞바퀴를 무는 집게
    const barDrop = Math.atan2(HITCH.y - 0.055, barLen); // 앞바퀴 축 높이까지 살짝 내려가요
    tug.visible = false;
    site.add(tug);
    const setGear = (b: Plane, k: number) => {
      for (const { g, axis, sign } of b.gears) {
        g.rotation[axis] = sign * (Math.PI / 2) * k;
        g.visible = k < 1;
      }
    };

    // 섹션에 들어오면 비행기가 유도로에서 게이트로 하나씩 들어와요
    const taxiIn = ScrollTrigger.create({
      trigger: el, start: "top 75%", once: true,
      onEnter: () => (arrived.current = true, !reduce && gsap.to(planes.filter((b) => b.arrive < 1), { arrive: 1, duration: 1.6, ease: "power2.out", stagger: 0.12 })),
    });

    // 이륙: 뒤로 밀려 나와 유도로를 따라 활주로로 가서, 달리다 기수를 들고 떠올라 바퀴를 접고 카메라 앞까지 날아와요
    let flight: gsap.core.Timeline | null = null;
    const v = new THREE.Vector3(), tan = new THREE.Vector3();
    const ramp = (u: number, a: number, b: number) => Math.min(1, Math.max(0, (u - a) / (b - a)));
    // back이면 길을 끝에서 처음으로 거꾸로 가요. 기수도 가는 쪽을 봐요.
    const follow = (b: Plane, path: THREE.CurvePath<THREE.Vector3>, u: number, pitch = 0, back = false) => {
      const t = back ? 1 - u : u;
      path.getPointAt(t, b.holder.position);
      path.getTangentAt(t, tan);
      if (back) tan.negate();
      if (tan.lengthSq() > 0) b.holder.lookAt(site.localToWorld(v.copy(b.holder.position).add(tan)));
      if (pitch) b.holder.rotateX(-pitch);
    };
    const takeOff = (i: number) => {
      const b = planes[i];
      if (reduce) return setPass(b.f);
      const { x, z, side, yaw } = b.gate;
      const start = new THREE.Vector3(x, 0, side * TAXI);
      const runway = new THREE.Vector3(XR, 0, -TAXI + 0.8);
      const corners = side > 0
        ? [start, new THREE.Vector3(XT, 0, TAXI), new THREE.Vector3(XT, 0, -TAXI), new THREE.Vector3(XR, 0, -TAXI), runway]
        : [start, new THREE.Vector3(XR, 0, -TAXI), runway];
      const taxi = roundedPath(corners);
      // 카메라 바로 앞, 살짝 아래에서 끝나요
      camera.updateMatrixWorld();
      const fwd = camera.getWorldDirection(new THREE.Vector3());
      const end = camera.position.clone().addScaledVector(fwd, 3.2).add(new THREE.Vector3(0, -0.35, 0));
      const approach = end.clone().addScaledVector(fwd, 7);
      const liftOff = new THREE.Vector3(XR, 0, 1.2);
      const air = new THREE.CurvePath<THREE.Vector3>();
      air.add(new THREE.LineCurve3(runway, liftOff));
      air.add(new THREE.CubicBezierCurve3(liftOff, new THREE.Vector3(XR, 0.9, 5.5), site.worldToLocal(approach), site.worldToLocal(end)));
      const ground = air.getCurveLengths()[0] / air.getLength(); // 활주로를 달리는 몫

      b.flying = true;
      b.tag.visible = false;
      const s = { push: 0, taxi: 0, air: 0, gear: 0, away: 0 };
      // 토잉카가 코에 붙어 밀어 내고, 다 밀면 떨어져 게이트 쪽으로 돌아가요
      tug.position.set(0, 0, TUG_Z);
      tug.rotation.set(0, 0, 0);
      bar.rotation.set(-barDrop, 0, 0);
      for (const w of steer) w.rotation.y = 0;
      tug.visible = true;
      b.holder.add(tug);
      const turn = Math.PI / 2 - yaw; // 밀려 나오며 오른쪽(+x)을 보게 돌아요
      // 착륙: 날아온 길을 되짚어 활주로에 내려앉고, 유도로를 거꾸로 따라가 게이트에 코를 대요
      const home = roundedPath([...corners].reverse().concat(new THREE.Vector3(x, 0, z)));
      const touch = 1 - ground; // 거꾸로 갈 때 바퀴가 닿는 때
      const land = () => {
        const l = { air: 0, taxi: 0, gear: 1 };
        follow(b, air, 0, 0, true); // 탑승권에 가려 있을 때 돌아서요
        flight = gsap.timeline({ onComplete: () => park(b) })
          .to(l, { air: 1, duration: 1.9, ease: "power2.out", onUpdate: () => follow(b, air, l.air, 0.1 * ramp(l.air, touch - 0.2, touch) * (1 - ramp(l.air, touch, touch + 0.08)), true) })
          .to(l, { gear: 0, duration: 0.45, ease: "power1.inOut", onUpdate: () => setGear(b, l.gear) }, 0.3)
          .to(l, { taxi: 1, duration: Math.min(1.4, Math.max(0.8, home.getLength() / 12)), ease: "power1.inOut", onUpdate: () => follow(b, home, l.taxi) });
      };
      flight = gsap.timeline({ onComplete: () => (flight = null, tug.visible = false, landing = land, setPass(b.f)) })
        .to(s, {
          push: 1, duration: 0.9, ease: "power1.inOut",
          onUpdate: () => (b.holder.position.set(x, 0, z + (side * TAXI - z) * s.push), b.holder.rotation.set(0, yaw + turn * s.push, 0)),
          onComplete: () => void site.attach(tug),
        })
        // 집게를 풀면 봉이 관절에서 들리고, 토잉카는 바퀴를 꺾어 게이트로 돌아가요
        .to(bar.rotation, { x: 0.35, duration: 0.25, ease: "power2.out" })
        .to(s, {
          away: 1, duration: 0.8, ease: "none",
          onUpdate: () => {
            const t = tug.worldToLocal(site.localToWorld(v.set(x, 0, z)));
            const a = THREE.MathUtils.clamp(Math.atan2(t.x, t.z), -0.55, 0.55);
            for (const w of steer) w.rotation.y = a;
            bar.rotation.y = -a * 0.6; // 꺾이는 쪽 반대로 봉이 끌려가요
            tug.rotateY(a * 0.12);
            tug.translateZ(Math.min(0.05, t.length() * 0.1));
          },
          onComplete: () => void (tug.visible = false),
        })
        // 토잉카가 비켜나기 시작하면 비행기도 움직여요
        .to(s, { taxi: 1, duration: Math.min(1.1, Math.max(0.6, taxi.getLength() / 14)), ease: "power1.in", onUpdate: () => follow(b, taxi, s.taxi) }, "<0.3")
        // 달리는 끝에 기수를 들고, 다가오면서 다시 수평으로 돌아와요
        .to(s, { air: 1, duration: 1.7, ease: "power2.in", onUpdate: () => follow(b, air, s.air, 0.16 * ramp(s.air, ground * 0.75, ground) * (1 - ramp(s.air, 0.7, 1))) })
        // power2.in이라 바퀴가 뜨는 때는 1.7·√(달리는 몫)초 뒤예요
        .to(s, { gear: 1, duration: 0.45, ease: "power1.inOut", onUpdate: () => setGear(b, s.gear) }, `<${1.7 * Math.sqrt(ground) + 0.12}`);
    };
    // 탑승권이 열린 동안 비행기는 카메라 앞에 떠 있고, 탑승권을 닫으면 착륙해서 게이트로 돌아가요
    let landing: (() => void) | null = null;
    const park = (b: Plane) => {
      flight = null;
      b.flying = false;
      b.tag.visible = true;
      b.holder.rotation.set(0, b.gate.yaw, 0);
      setGear(b, 0);
    };
    api.current = {
      land: () => {
        landing?.();
        landing = null;
        gsap.to(planes.filter((b) => b.arrive < 1), { arrive: 1, duration: 1.4, ease: "power2.out" });
      },
    };

    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      labels.setSize(w, h);
      camera.aspect = w / h;
      // 세로 화면은 계류장을 돌려 긴 쪽이 안쪽으로 가게 해요
      const narrow = w / h < 1.1;
      world.rotation.y = narrow ? Math.PI / 2 : 0;
      for (const m of signs) m.rotation.y = -world.rotation.y; // 지붕 글자는 돌린 화면에서도 똑바로 읽혀요
      const long = AW / 2 - 0.4, short = AD / 2;
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const d = Math.max((narrow ? short : long) / (t * camera.aspect), ((narrow ? long : short) * 0.8 + 1.4) / t);
      camera.position.set(0, d * 0.75, d * 0.66);
      camera.lookAt(0, 0.3, 0.3);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    const ray = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerIn = false;
    let hovered = -1;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      pointerIn = true;
    };
    const onLeave = () => (pointerIn = false);
    const onClick = (e: MouseEvent) => {
      if (flight) return flight.progress(1); // 나는 중에 누르면 바로 끝으로 넘어가요
      // 터치는 올려 두기 없이 바로 누르니까 누른 자리에서 다시 찾아요
      onMove(e as PointerEvent);
      ray.setFromCamera(mouse, camera);
      const i = ray.intersectObjects(pickables, false)[0]?.object.userData.i as number | undefined;
      if (i !== undefined && planes[i].arrive === 1 && !planes[i].flying) takeOff(i);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("click", onClick);

    let raf = 0, visible = false, last = performance.now();
    const tick = () => {
      raf = visible ? requestAnimationFrame(tick) : 0;
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = Math.min(1, dt * 10);

      if (pointerIn && !flight) {
        // 들린 비행기로 재면 가장자리에서 들렸다 내렸다 떨려서, 게이트에 선 자리로 재요
        for (const b of planes) (b.plane.position.y = PLANE_Y, b.plane.updateMatrixWorld(true));
        ray.setFromCamera(mouse, camera);
        hovered = labelHover >= 0 ? labelHover : (ray.intersectObjects(pickables, false)[0]?.object.userData.i as number | undefined) ?? -1;
      } else hovered = -1;
      el.style.cursor = hovered >= 0 || flight ? "pointer" : "";

      const blink = ((now / 1000) % 1.4) / 0.35; // 1.4초마다 0.35초 동안 부드럽게 켜졌다 꺼져요
      const pulse = blink < 1 ? Math.sin(Math.PI * blink) : 0;
      for (const m of beaconMats) m.opacity = 0.3 + 0.7 * pulse;
      for (const m of haloMats) m.opacity = 0.15 + 0.85 * pulse;
      tugBeacon.visible = (now / 1000) % 0.5 < 0.25; // 토잉카 경광등
      planes.forEach((b, i) => {
        if (b.flying) return; // 나는 동안은 이륙 애니메이션이 자리를 잡아요
        const { x, z, side } = b.gate;
        const out = (1 - b.arrive) * 7; // 아직 안 들어온 만큼 바깥에 있어요
        b.lift += ((i === hovered ? 0.3 : 0) - b.lift) * k;
        b.holder.position.set(x, 0, z + side * out);
        b.plane.position.y = PLANE_Y + b.lift;
        b.tag.position.y = PLANE_Y + 1.6; // 이만큼 올려야 비스듬히 봐도 기수를 안 가려요. 올려도 꼬리표는 제자리예요.
        (b.tag.element.firstElementChild as HTMLElement).style.scale = String(1 + b.lift * 0.3);
        const want = b.arrive;
        b.alpha += (want - b.alpha) * k;
        if (Math.abs(want - b.alpha) < 0.005) b.alpha = want;
        // 다 보일 때는 불투명으로 그려야 부품끼리 비쳐 보이지 않아요
        const see = b.alpha < 1;
        for (const m of b.mats) {
          m.opacity = b.alpha;
          if (m.transparent !== see) (m.transparent = see, m.needsUpdate = true);
        }
        b.tag.element.style.opacity = String(b.alpha);
      });
      renderer.render(scene, camera);
      labels.render(scene, camera);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        tick();
      }
    });
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      visible = false;
      io.disconnect();
      ro.disconnect();
      taxiIn.kill();
      flight?.kill();
      gsap.killTweensOf(planes);
      api.current = null;
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("click", onClick);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      labels.domElement.remove();
    };
  }, [dark, narrow]);

  return (
    <section id="flights" ref={root} className="relative isolate flex flex-col justify-center bg-terminal pb-16 pt-[calc(var(--bar)+48px)] lg:min-h-[100svh] lg:pb-6 lg:pt-[calc(var(--bar)+16px)]">
      <Sky />
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div data-head>
            <h2 className="text-[clamp(32px,3.6vw,52px)] font-bold leading-[1.15] tracking-[-0.03em]">지금까지 만든 프로젝트예요.</h2>
            <p className="mt-2 text-[17px] text-sub max-md:hidden sm:text-[19px]">비행기를 누르면 이륙해서 탑승권을 건네줘요.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 max-md:hidden">
            <ul className="flex flex-wrap gap-3 text-[13px] font-medium text-sub" aria-label="꼬리표 색">
              {KIND_ORDER.map((k) => (
                <li key={k} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: KIND_COLOR[k] }} />{k}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* 계류장은 내용 폭을 벗어나 화면 끝까지 펼쳐요 */}
      <div ref={host} aria-hidden className={`relative mt-[clamp(20px,4svh,48px)] h-[min(72svh,760px)] min-h-[440px] w-full max-md:hidden [&>canvas]:relative [&>canvas]:h-full [&>canvas]:w-full ${noGL ? "hidden" : ""}`} />

      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">

        {/* 화면 읽기 프로그램과 WebGL이 없는 환경은 목록으로 봐요 */}
        <ProjectCards />
        <ul className={noGL ? "mt-8 grid gap-2 max-md:hidden sm:grid-cols-2" : "sr-only max-md:hidden"}>
          {FLIGHTS.map((f) => (
            <li key={f.name}>
              <button type="button" onClick={() => setPass(f)} className="flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-left">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: KIND_COLOR[f.kind] }} />
                <span className="font-semibold">{f.nameKo}</span>
                <span className="text-[14px] text-muted">{f.flight} · {f.gate} · {f.year}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {pass && <BoardingPass f={pass} onClose={() => (setPass(null), api.current?.land())} />}
    </section>
  );
}

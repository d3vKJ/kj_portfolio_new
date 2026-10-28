"use client";

import Sky from "@/components/Sky";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import SkillIcon from "@/components/SkillIcon";
import { GROUPS, ICONS } from "@/data/skills";
import { PROJECTS } from "@/data/projects";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isNarrow, useNarrow } from "@/lib/media";

const GROUP_META: Record<string, { ko: string; band: string }> = {
  "Language": { ko: "언어", band: "#fe9800" },
  "Frontend": { ko: "프론트엔드", band: "#3182f6" },
  "Library": { ko: "라이브러리", band: "#6b7684" },
  "Design": { ko: "디자인", band: "#f04452" },
  "Tools & DX": { ko: "도구", band: "#18a5a7" },
  "Backend/Infra": { ko: "백엔드·인프라", band: "#03b26c" },
  "AI": { ko: "AI", band: "#a234c7" },
};
const BAGS = GROUPS.flatMap((g) => g.skills.map((name) => ({ name, group: g.label })));
const GROUP_OF = new Map(BAGS.map((b) => [b.name, b.group]));

const CARRIED = new Map<string, { nameKo: string; year: string; usage: string }[]>();
for (const p of PROJECTS) {
  for (const tu of p.techUsage) {
    if (!CARRIED.has(tu.skill)) CARRIED.set(tu.skill, []);
    CARRIED.get(tu.skill)!.push({ nameKo: p.nameKo, year: p.year, usage: tu.usage });
  }
}
for (const ai of GROUPS.find((g) => g.label === "AI")!.skills) {
  CARRIED.set(ai, PROJECTS.map((p) => ({ nameKo: p.nameKo, year: p.year, usage: "모든 프로젝트를 만들 때 적극적으로 활용했어요." })));
}

// 벨트: 직선 L, 반원 반지름 R인 경기장 모양 고리
const L = 8.5;
const R = 3.2;
const P = 2 * L + 2 * Math.PI * R;
const BASE = 0.42; // 철제 받침 높이
const BELT_TOP = BASE + 0.06;

/** 벨트 위 거리 s의 (x, z) */
function along(s: number): [number, number] {
  s = ((s % P) + P) % P;
  if (s < L) return [-L / 2 + s, R];
  s -= L;
  if (s < Math.PI * R) return [L / 2 + R * Math.sin(s / R), R * Math.cos(s / R)];
  s -= Math.PI * R;
  if (s < L) return [L / 2 - s, -R];
  s -= L;
  return [-L / 2 - R * Math.sin(s / R), -R * Math.cos(s / R)];
}

function stadium<T extends THREE.Path>(r: number, p: T) {
  p.moveTo(-L / 2, -r);
  p.lineTo(L / 2, -r);
  p.absarc(L / 2, 0, r, -Math.PI / 2, Math.PI / 2, false);
  p.lineTo(-L / 2, r);
  p.absarc(-L / 2, 0, r, Math.PI / 2, Math.PI * 1.5, false);
  return p;
}

/** 안쪽 반지름 inner, 바깥 반지름 outer인 고리(inner 0이면 꽉 찬 판)를 높이 h로 세워요 */
function ring(inner: number, outer: number, h: number, bevel = 0) {
  const shape = stadium(outer, new THREE.Shape());
  if (inner > 0) shape.holes.push(stadium(inner, new THREE.Path()));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: h, curveSegments: 48, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3 });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function logoSrc(name: string) {
  const info = ICONS[name];
  if (info.svg) {
    const svg = info.svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" ').replaceAll("currentColor", "#191f28");
    return URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  }
  // 흰 로고는 흰 꼬리표 위에서 안 보여서 검게 받아요
  return `https://cdn.simpleicons.org/${info.slug}/${info.light ? "191f28" : info.color.slice(1)}`;
}

/** 벨트 아래 번진 그림자: 고리 모양을 흐리게 칠해요 */
function contactShadow(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = Math.round((1024 * h) / w);
  const g = c.getContext("2d")!;
  const k = c.width / w;
  g.translate(c.width / 2, c.height / 2);
  g.scale(k, k);
  g.filter = `blur(${0.35 * k}px)`;
  g.fillStyle = "rgba(0, 29, 58, 0.42)";
  // 캔버스로 같은 경기장 모양을 그리려고 Path 흉내를 내요
  const pen = {
    moveTo: (x: number, y: number) => g.moveTo(x, y),
    lineTo: (x: number, y: number) => g.lineTo(x, y),
    absarc: (x: number, y: number, r: number, a0: number, a1: number, cw: boolean) => g.arc(x, y, r, a0, a1, cw),
  } as unknown as THREE.Path;
  g.beginPath();
  stadium(R + 0.95, pen);
  stadium(R - 0.95, pen);
  g.fill("evenodd");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const TAG_W = 128, TAG_H = 42;

/** 꺼낸 가방 윗면에 붙는 스티커: 흰 바탕에 분류 색 띠, 로고, 이름 */
function tagTexture(name: string, color: string) {
  const c = document.createElement("canvas");
  const k = 4; // 가방이 화면 앞으로 크게 나와서 넉넉히 그려요
  c.width = Math.round(TAG_W * k);
  c.height = Math.round(TAG_H * k);
  const g = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false; // 밉맵은 줄여 그리며 글씨를 뭉개요
  tex.minFilter = THREE.LinearFilter;
  let logo: HTMLImageElement | undefined;
  const paint = () => {
    g.setTransform(k, 0, 0, k, 0, 0);
    g.clearRect(0, 0, TAG_W, TAG_H);
    g.fillStyle = "#fff";
    g.beginPath();
    g.roundRect(1, 1, TAG_W - 2, TAG_H - 2, 10);
    g.fill();
    g.strokeStyle = "#d1d6db";
    g.lineWidth = 1;
    g.stroke();
    g.fillStyle = color;
    g.beginPath();
    g.roundRect(1, 1, 6, TAG_H - 2, [10, 0, 0, 10]);
    g.fill();
    if (logo) g.drawImage(logo, 14, 11, 20, 20);
    g.fillStyle = "#191f28";
    g.textBaseline = "middle";
    let size = 15;
    do g.font = `700 ${size--}px Pretendard, system-ui, sans-serif`;
    while (g.measureText(name).width > TAG_W - 50 && size > 10);
    g.fillText(name, 40, TAG_H / 2 + 1);
    tex.needsUpdate = true;
  };
  paint();
  document.fonts.ready.then(paint);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => ((logo = img), paint());
  img.src = logoSrc(name);
  return { tex, src: img.src };
}

/** 벨트 위 꼬리표: 진짜 글자(HTML)로 그려야 어느 화면에서도 또렷해요 */
function tagElement(name: string, logo: string, color: string) {
  const el = document.createElement("div");
  el.className = "pointer-events-auto flex cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-xl border border-l-[6px] border-line bg-card py-1.5 pl-2.5 pr-3.5 text-[14px] font-bold text-ink shadow-[0_6px_16px_-8px_rgba(0,29,58,.35)] [transform-origin:50%_100%] max-sm:text-[12px]";
  el.style.borderLeftColor = color;
  const img = document.createElement("img");
  img.src = logo;
  img.alt = "";
  img.className = "h-[18px] w-[18px] max-sm:h-4 max-sm:w-4";
  el.append(img, name);
  return el;
}

/** 꺼낸 가방 옆에 뜨는 카드: 이 기술을 쓴 프로젝트와 한 줄 설명 */
function SkillCard({ name, onClose }: { name: string; onClose: () => void }) {
  const meta = GROUP_META[GROUP_OF.get(name)!];
  const carried = CARRIED.get(name) ?? [];
  // AI 도구처럼 모든 프로젝트에 같은 설명이면 설명은 한 번만 쓰고 프로젝트 이름만 늘어놓아요
  const same = carried.length > 1 && carried.every((c) => c.usage === carried[0].usage);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => closeBtn.current?.focus({ preventScroll: true }), [name]);

  return (
    <div
      role="dialog"
      aria-labelledby="skill-card-title"
      className="pop-in absolute inset-x-3 bottom-3 z-10 flex max-h-[58%] flex-col rounded-3xl bg-card p-6 shadow-[0_30px_60px_-24px_rgba(0,29,58,.35)] md:inset-x-auto md:bottom-auto md:right-[6%] md:top-1/2 md:max-h-[84%] md:w-[400px] md:-translate-y-1/2"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold" style={{ background: `color-mix(in srgb, ${meta.band} 12%, white)`, color: meta.band }}>
          <span className="h-2 w-2 rounded-full" style={{ background: meta.band }} />
          {meta.ko}
        </span>
        <button ref={closeBtn} type="button" onClick={onClose} aria-label="닫기" className="grid h-9 w-9 place-items-center rounded-full text-lg text-muted hover:bg-surface hover:text-ink">✕</button>
      </div>
      <p id="skill-card-title" className="mt-3 flex items-center gap-3 text-[30px] font-bold tracking-[-0.02em]">
        <SkillIcon name={name} size={32} onPaper /> {name}
      </p>
      <p className="mt-5 border-t border-line pt-4 text-[15px] font-semibold text-sub">사용한 프로젝트 <span className="text-ink">{carried.length}개</span></p>
      {carried.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-surface px-4 py-3 text-[14px] text-sub">여기 소개한 프로젝트 중에는 아직 이 기술을 쓴 프로젝트가 없어요.</p>
      ) : same ? (
        <div className="mt-3">
          <p className="text-[15px] leading-6 text-sub">{carried[0].usage}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {carried.map((c) => <li key={c.nameKo} className="rounded-lg bg-surface px-2.5 py-1 text-[14px] font-medium">{c.nameKo}</li>)}
          </ul>
        </div>
      ) : (
        <ul className="mt-3 min-h-0 space-y-2 overflow-y-auto overscroll-contain">
          {carried.map((c) => (
            <li key={c.nameKo} className="rounded-2xl bg-surface px-4 py-3">
              <p className="flex items-baseline justify-between">
                <span className="font-semibold">{c.nameKo}</span>
                <span className="text-[12px] text-muted">{c.year}</span>
              </p>
              <p className="mt-0.5 text-[14px] leading-6 text-sub">{c.usage}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** 기술 목록: 공항 수하물 벨트 위를 기술 가방이 돌아요. 누르면 가방이 화면 앞으로 튀어나오고 쓴 프로젝트를 보여 줘요. */
export default function Baggage() {
  const root = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const focusRef = useRef<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [noGL, setNoGL] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const api = useRef<{ close(): void } | null>(null);
  const narrow = useNarrow();
  focusRef.current = focus;

  useGSAP(() => {
    gsap.from("[data-head] > *", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 60%" } });
  }, { scope: root });

  useEffect(() => {
    if (isNarrow()) return; // 폰은 벨트 없이 목록만 보여 줘요
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
    const blobs: string[] = [];
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const world = new THREE.Group();
    scene.add(world);

    // 방 안 조명을 비춘 환경: 철제 테두리와 가방에 은은한 반사가 생겨요
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    scene.environment = track(pmrem.fromScene(room, 0.04).texture);
    scene.environmentIntensity = 0.45;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d3df, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(-5, 12, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0005;
    Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 });
    scene.add(sun);

    const mesh = (geo: THREE.BufferGeometry, color: string, rough = 0.6, metal = 0, y = 0) => {
      const m = new THREE.Mesh(track(geo), track(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })));
      m.castShadow = m.receiveShadow = true;
      m.position.y = y;
      world.add(m);
      return m;
    };
    mesh(ring(R - 0.8, R + 0.8, BASE - 0.02, 0.02), "#dfe4ea", 0.32, 0.55); // 철제 받침
    mesh(ring(R - 0.6, R + 0.6, 0.06), "#23282f", 0.85, 0, BASE); // 고무 벨트
    mesh(ring(R + 0.6, R + 0.8, 0.12, 0.03), "#eef1f4", 0.22, 0.7, BASE); // 바깥 테두리
    mesh(ring(R - 0.8, R - 0.6, 0.12, 0.03), "#eef1f4", 0.22, 0.7, BASE); // 안쪽 테두리: 가운데는 뚫려 있어요

    // 바닥: 무늬 없이 그림자만 받아요. 아래엔 번진 그림자를 깔아 땅에 붙어 보이게 해요.
    const catcher = new THREE.Mesh(track(new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI / 2)), track(new THREE.ShadowMaterial({ color: "#001d3a", opacity: 0.16 })));
    catcher.receiveShadow = true;
    world.add(catcher);
    const sw = L + 2 * R + 4, sh = 2 * R + 4;
    const blur = new THREE.Mesh(track(new THREE.PlaneGeometry(sw, sh).rotateX(-Math.PI / 2)), track(new THREE.MeshBasicMaterial({ map: track(contactShadow(sw, sh)), transparent: true, depthWrite: false })));
    blur.position.y = 0.002;
    blur.renderOrder = -1;
    world.add(blur);

    // 벨트 철판 이음매: 가방과 같이 흘러서 벨트가 도는 게 보여요
    const SLATS = 180;
    const slats = new THREE.InstancedMesh(track(new THREE.BoxGeometry(0.028, 0.01, 1.16)), track(new THREE.MeshStandardMaterial({ color: "#59626e", roughness: 0.5, metalness: 0.4 })), SLATS);
    slats.receiveShadow = true;
    world.add(slats);
    const dummy = new THREE.Object3D();

    const bodyGeo = track(new RoundedBoxGeometry(1.0, 0.38, 0.68, 3, 0.09));
    const handleGeo = track(new THREE.TorusGeometry(0.14, 0.035, 8, 20, Math.PI));
    const handleMat = track(new THREE.MeshStandardMaterial({ color: "#191f28", roughness: 0.5 }));
    const pickables: THREE.Object3D[] = [];
    const bags = BAGS.map((b, i) => {
      const color = GROUP_META[b.group].band;
      const holder = new THREE.Group();
      const inner = new THREE.Group();
      const mat = track(new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.2, transparent: true }));
      const body = new THREE.Mesh(bodyGeo, mat);
      body.castShadow = true;
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.y = 0.19;
      inner.add(body, handle);
      const { tex, src } = tagTexture(b.name, color);
      if (src.startsWith("blob:")) blobs.push(src);
      track(tex);
      const tag = new CSS2DObject(tagElement(b.name, src, color));
      tag.center.set(0.5, 1); // 아래 가운데를 가방 위에 걸어요
      tag.element.addEventListener("pointerenter", () => (labelHover = i));
      tag.element.addEventListener("pointerleave", () => (labelHover = -1));
      tag.element.addEventListener("click", (e) => {
        e.stopPropagation(); // 캔버스 클릭으로 한 번 더 잡히지 않게
        if (hero) close();
        else if (!anim) open(i);
      });
      body.userData.i = i;
      pickables.push(body);
      inner.position.y = reduce ? BELT_TOP + 0.19 : 12;
      holder.add(inner, tag);
      world.add(holder);
      return { ...b, holder, inner, tag, tex, mat, lift: 0, alpha: 1 };
    });

    // 올린 가방의 꼬리표를 본떠 벨트 가운데 빈자리로 날려 크게 보여요. 원래 꼬리표는 제자리에서 투명해져 마우스를 계속 받아요.
    const show = new CSS2DObject(document.createElement("div"));
    show.element.style.pointerEvents = "none";
    show.visible = false;
    world.add(show);
    let shown = -1;

    // 섹션에 들어오면 가방이 위에서 하나씩 떨어져요
    const drop = ScrollTrigger.create({
      trigger: el, start: "top 75%", once: true,
      onEnter: () => !reduce && gsap.to(bags.map((b) => b.inner.position), { y: BELT_TOP + 0.19, duration: 0.9, ease: "bounce.out", stagger: 0.035 }),
    });

    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      labels.setSize(w, h);
      camera.aspect = w / h;
      // 세로 화면은 벨트를 돌려 긴 쪽이 안쪽으로 가게 해요
      const narrow = w / h < 1.1;
      world.rotation.y = narrow ? Math.PI / 2 : 0;
      const halfW = (narrow ? R : L / 2 + R) + 2; // 꼬리표가 벨트 밖으로 나오는 만큼 여유
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const d = Math.max(halfW / (tan * camera.aspect), ((narrow ? L / 2 + R : R) * 0.8 + 1.8) / tan); // 기울어 보여서 깊이는 0.8배
      camera.position.set(0, d * 0.72, d * 0.7);
      camera.lookAt(0, 0.1, 0.5);
      camera.updateProjectionMatrix();
      if (anim) (aim(), place());
    };
    // 가방을 누르면 화면 앞으로 튀어나와요. 원래 가방은 숨기고 같은 모양을 카메라 앞으로 날려요.
    const stickerGeo = track(new THREE.PlaneGeometry(0.86, 0.287).rotateX(-Math.PI / 2));
    type Hero = { i: number; g: THREE.Group; spin: THREE.Group };
    let hero: Hero | null = null; // 열려 있는 가방
    let anim: Hero | null = null; // 날아가는 중이거나 열려 있는 가방
    const p = { t: 0 };
    const pos0 = new THREE.Vector3(), pos1 = new THREE.Vector3(), q0 = new THREE.Quaternion(), q1 = new THREE.Quaternion(), tmp = new THREE.Vector3();
    const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2 - 0.3);
    let size = 1;
    function aim() {
      camera.updateMatrixWorld();
      const D = 6;
      const h = 2 * D * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), w = h * camera.aspect;
      const wide = el.clientWidth >= 768; // 넓으면 왼쪽에 가방, 오른쪽에 카드. 좁으면 위에 가방, 아래에 카드.
      pos1.set(wide ? -w * 0.18 : 0, wide ? 0 : h * 0.24, -D).applyMatrix4(camera.matrixWorld);
      q1.copy(camera.quaternion).multiply(tilt); // 윗면이 화면을 보고 살짝 기울어요
      size = Math.min(w * (wide ? 0.3 : 0.5), (h * 0.42) / 0.68);
    }
    function place() {
      if (!anim) return;
      anim.g.position.lerpVectors(pos0, pos1, p.t);
      anim.g.quaternion.slerpQuaternions(q0, q1, p.t);
      anim.g.scale.setScalar(1 + (size - 1) * p.t);
      anim.spin.rotation.y = (1 - p.t) * Math.PI * 2; // 날아오며 한 바퀴 돌아요
    }
    const open = (i: number) => {
      const b = bags[i];
      const spin = new THREE.Group();
      const body = new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({ color: GROUP_META[b.group].band, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.2 }));
      const sticker = new THREE.Mesh(stickerGeo, new THREE.MeshBasicMaterial({ map: b.tex, transparent: true }));
      sticker.position.y = 0.192;
      spin.add(body, sticker);
      const g = new THREE.Group();
      g.add(spin);
      scene.add(g);
      b.inner.updateWorldMatrix(true, false);
      b.inner.matrixWorld.decompose(pos0, q0, tmp);
      b.holder.visible = false;
      hero = anim = { i, g, spin };
      aim();
      p.t = 0;
      place();
      gsap.to(p, { t: 1, duration: reduce ? 0 : 0.8, ease: "back.out(1.4)", onUpdate: place });
      setPicked(b.name);
    };
    const close = () => {
      if (!hero) return;
      const h = hero;
      hero = null;
      setPicked(null);
      gsap.to(p, {
        t: 0, duration: reduce ? 0 : 0.5, ease: "power2.in", onUpdate: place,
        onComplete: () => {
          scene.remove(h.g);
          h.g.traverse((o) => o instanceof THREE.Mesh && (o.material as THREE.Material).dispose());
          bags[h.i].holder.visible = true;
          anim = null;
        },
      });
    };
    api.current = { close };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    addEventListener("keydown", onKey);

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
    const onClick = () => {
      if (hero) close();
      else if (hovered >= 0 && !anim) open(hovered);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("click", onClick);

    let raf = 0, visible = false, offset = 0, speed = reduce ? 0 : 0.7, last = performance.now();
    const tick = () => {
      raf = visible ? requestAnimationFrame(tick) : 0;
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (pointerIn && !anim) {
        // 들린 가방으로 재면 가장자리에서 들렸다 내렸다 떨려서, 벨트에 놓인 자리로 재요
        for (const b of bags) (b.holder.position.y = 0, b.holder.updateMatrixWorld(true));
        ray.setFromCamera(mouse, camera);
        hovered = labelHover >= 0 ? labelHover : (ray.intersectObjects(pickables, false)[0]?.object.userData.i as number | undefined) ?? -1;
      } else hovered = -1;
      el.style.cursor = hovered >= 0 || hero ? "pointer" : "";

      // 가방에 올리거나 꺼내 보는 동안 벨트가 서서히 멈춰요
      speed += ((hovered >= 0 || anim || reduce ? 0 : 0.7) - speed) * Math.min(1, dt * 4);
      if (anim && !reduce) anim.spin.position.y = Math.sin(now / 500) * 0.03; // 둥실 떠 있어요
      offset += speed * dt;
      const k = Math.min(1, dt * 10);
      for (let j = 0; j < SLATS; j++) {
        const s = offset + (j * P) / SLATS;
        const [x, z] = along(s);
        const [x2, z2] = along(s + 0.01);
        dummy.position.set(x, BELT_TOP, z);
        dummy.rotation.y = -Math.atan2(z2 - z, x2 - x);
        dummy.updateMatrix();
        slats.setMatrixAt(j, dummy.matrix);
      }
      slats.instanceMatrix.needsUpdate = true;
      bags.forEach((b, i) => {
        const s = offset + (i * P) / bags.length;
        const [x, z] = along(s);
        const [x2, z2] = along(s + 0.01);
        b.lift += ((i === hovered ? 0.35 : 0) - b.lift) * k;
        b.holder.position.set(x, b.lift, z);
        b.holder.rotation.y = -Math.atan2(z2 - z, x2 - x);
        b.tag.position.y = b.inner.position.y + 0.55 - b.lift; // 꼬리표는 제자리에 둬야 마우스가 안 빠져요
        const dim = anim ? i !== anim.i : focusRef.current && b.group !== focusRef.current;
        const want = dim ? 0.15 : 1;
        b.alpha += (want - b.alpha) * k;
        if (Math.abs(want - b.alpha) < 0.005) b.alpha = want;
        b.mat.opacity = b.alpha;
        // 다 보일 때는 불투명으로 그려야 비쳐 보이지 않아요
        if (b.mat.transparent !== b.alpha < 1) (b.mat.transparent = b.alpha < 1, b.mat.needsUpdate = true);
        // 꺼내 보는 동안 다른 꼬리표는 숨겨요. HTML이라 꺼낸 가방 위에 비쳐 보여요.
        b.tag.element.style.opacity = anim ? "0" : String(b.alpha * (1 - b.lift / 0.35));
      });
      if (hovered >= 0 && hovered !== shown) {
        shown = hovered;
        const copy = bags[shown].tag.element.cloneNode(true) as HTMLElement;
        copy.style.cssText = `border-left-color:${bags[shown].tag.element.style.borderLeftColor};pointer-events:none;transform-origin:50% 50%`;
        show.element.replaceChildren(copy);
      }
      const t = shown >= 0 && !anim ? bags[shown].lift / 0.35 : 0;
      show.visible = t > 0.01;
      if (show.visible) {
        const sb = bags[shown], e = t * t * (3 - 2 * t), from = sb.inner.position.y + 0.55;
        show.position.set(sb.holder.position.x * (1 - e), from + (BELT_TOP - from) * e, sb.holder.position.z * (1 - e));
        show.center.set(0.5, 1 - 0.5 * e); // 가운데에선 꼬리표 한가운데를 맞춰요
        // 크기는 안쪽에 줘요. 바깥 칸에 주면 위치 이동까지 같이 커져서 엉뚱한 데로 가요.
        (show.element.firstElementChild as HTMLElement).style.scale = String(1 + 1.2 * e);
        show.element.style.opacity = String(sb.alpha);
      }
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
      drop.kill();
      gsap.killTweensOf(p);
      removeEventListener("keydown", onKey);
      api.current = null;
      bags.forEach((b) => gsap.killTweensOf([b.inner.position, b.inner.rotation]));
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("click", onClick);
      blobs.forEach((u) => URL.revokeObjectURL(u));
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      labels.domElement.remove();
    };
  }, [narrow]);

  return (
    <section id="skills" ref={root} className="relative isolate flex flex-col justify-center bg-floor pb-16 pt-[calc(var(--bar)+48px)] lg:min-h-[100svh] lg:pb-6 lg:pt-[calc(var(--bar)+16px)]">
      <Sky />
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div data-head>
            <h2 className="text-[clamp(32px,3.6vw,52px)] font-bold leading-[1.15] tracking-[-0.03em]">다룰 수 있는 기술이에요.</h2>
            <p className="mt-2 text-[17px] text-sub max-md:hidden sm:text-[19px]">가방을 누르면 그 기술을 쓴 프로젝트를 보여 줘요.</p>
          </div>
          {/* 프로젝트 섹션 토글과 같은 모양. 분류를 고르면 그 분류 가방만 또렷해져요 */}
          {/* .seg의 display가 레이어 밖이라 감추는 건 바깥 div가 맡아요 */}
          <div className="max-md:hidden">
          <div className="seg flex-wrap" role="group" aria-label="기술 분류">
            <button type="button" aria-pressed={focus === null} onClick={() => setFocus(null)}>전체</button>
            {GROUPS.map((g) => (
              <button key={g.label} type="button" aria-pressed={focus === g.label} onClick={() => setFocus(g.label)} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: GROUP_META[g.label].band }} />
                {GROUP_META[g.label].ko}
              </button>
            ))}
          </div>
          </div>
        </div>

        <div className="relative mt-[clamp(28px,5svh,64px)] max-md:hidden">
          <div ref={host} aria-hidden className="relative h-[min(70svh,720px)] min-h-[420px] w-full [&>canvas]:relative [&>canvas]:h-full [&>canvas]:w-full" />
          {picked && <SkillCard name={picked} onClose={() => api.current?.close()} />}
        </div>

        {/* 폰, 화면 읽기 프로그램, WebGL이 없는 환경은 목록으로 봐요 */}
        <div className={noGL ? "-mt-[min(70svh,720px)] grid gap-4 max-md:mt-8" : "mt-8 grid gap-5 md:sr-only"}>
          {GROUPS.map((g) => (
            <div key={g.label}>
              <p className="text-[15px] font-semibold">{GROUP_META[g.label].ko}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {g.skills.map((s) => (
                  <li key={s} className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-[15px] font-semibold">
                    <SkillIcon name={s} size={20} onPaper />{s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { LAND_MASK } from "@/data/land";
import { KOREA } from "@/data/korea";
import { gsap } from "@/lib/gsap";
import type { Look } from "@/lib/weather";

const R = 1;
const Z = new THREE.Vector3(0, 0, 1);
export const DAEGU: [number, number] = [35.87, 128.6];
const ROUTES: [number, number][] = [
  [35.55, 139.78], [37.62, -122.38], [51.47, -0.45], [40.64, -73.78],
  [1.36, 103.99], [-33.94, 151.18], [25.25, 55.36], [49.01, 2.55],
];
// 카메라 고도(지구 반지름 단위). 확대는 로그로 보간해요.
const ALT_FAR = 4.2;
const ALT_NEAR = 0.2;
// 착륙 구름층: 대구 바로 위 이 고도 사이에 두껍게 깔려요. 카메라는 그 안(ALT_END)까지 내려가 하얗게 덮여요.
const DECK_LO = 0.035, DECK_HI = 0.105;
const ALT_END = 0.06;

export function toVec(lat: number, lon: number, r = R) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

const decode = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const bit = (bits: Uint8Array, i: number) => (bits[i >> 3] >> (i & 7)) & 1;

export function worldDots(count: number) {
  const bits = decode(LAND_MASK);
  const pts: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const lat = THREE.MathUtils.radToDeg(Math.asin(y));
    const lon = ((THREE.MathUtils.radToDeg(i * golden) % 360) + 360) % 360 - 180;
    const row = Math.min(179, Math.floor(90 - lat)), col = Math.min(359, Math.floor(lon + 180));
    if (lat < -60 || !bit(bits, row * 360 + col)) continue;
    const v = toVec(lat, lon, R * 1.002);
    pts.push(v.x, v.y, v.z);
  }
  return new Float32Array(pts);
}

function koreaDots() {
  const bits = decode(KOREA.mask);
  const pts: number[] = [];
  for (let r = 0; r < KOREA.h; r++) {
    for (let c = 0; c < KOREA.w; c++) {
      if (!bit(bits, r * KOREA.w + c)) continue;
      const v = toVec(KOREA.lat1 - (r + 0.5) * KOREA.step, KOREA.lon0 + (c + 0.5) * KOREA.step, R * 1.0004);
      pts.push(v.x, v.y, v.z);
    }
  }
  return new Float32Array(pts);
}

export function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(32, 32, 26, 0, Math.PI * 2);
  g.fill();
  return new THREE.CanvasTexture(c);
}

/** 값 노이즈 + fbm으로 그린 부드러운 구름 한 조각(퍼프). 구름 한 덩이는 이 퍼프를 여러 장 겹쳐 만들어요. */
function puffTexture(seed: number) {
  const N = 256;
  const perm = new Uint8Array(512);
  let st = seed;
  const rnd = () => ((st = (st * 16807) % 2147483647) / 2147483647);
  const p = Array.from({ length: 256 }, (_, i) => i).sort(() => rnd() - 0.5);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const hash = (x: number, y: number) => perm[(perm[x & 255] + y) & 511] / 255;
  const fade = (t: number) => t * t * (3 - 2 * t);
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = fade(x - xi), yf = fade(y - yi);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
  const fbm = (x: number, y: number) => {
    let v = 0, amp = 0.5;
    for (let o = 0; o < 5; o++) { v += amp * noise(x, y); x *= 2.03; y *= 2.03; amp *= 0.5; }
    return v;
  };
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const g = c.getContext("2d")!;
  const img = g.createImageData(N, N);
  const ox = rnd() * 100, oy = rnd() * 100;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const u = i / N - 0.5, v = j / N - 0.5;
      const n = fbm(u * 5 + ox, v * 5 + oy);
      // 둥근 윤곽을 노이즈로 흩뜨려 가장자리가 솜처럼 풀려요. 바깥(r≥0.5)은 반드시 투명해야 사각 테두리가 안 보여요.
      const r = Math.sqrt(u * u + v * v) * 2;
      const fall = Math.max(0, 1 - r);
      const d = Math.min(1, Math.max(0, fall * 1.6 + (n - 0.5) * 1.1 - 0.15)) * Math.min(1, fall * 3);
      const k = (j * N + i) * 4;
      const light = 0.86 + n * 0.14; // 속에 옅은 결
      img.data[k] = img.data[k + 1] = img.data[k + 2] = 255 * light;
      img.data[k + 3] = 255 * d * d * (3 - 2 * d) * 0.85;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type Props = {
  /** 0 = 지구 전체, 1 = 대구까지 확대, 2 = 대구 위 구름층 속으로 들어가 하얗게 덮임 */
  zoom: RefObject<number>;
  /** 대구 위치를 따라다닐 라벨 */
  label?: RefObject<HTMLElement | null>;
  /** 대구 날씨에 맞춘 구름 양·먹구름·비 */
  sky?: RefObject<Look | null>;
  className?: string;
};

export default function Globe({ zoom, label, sky, className = "" }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // WebGL이 없으면 지구본만 빠져요
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 50);

    // 별: 흩어진 별 + 은하수 띠. 대기권에 들어서면 사라져요.
    const starCount = 5200;
    const starPos = new Float32Array(starCount * 3), starSize = new Float32Array(starCount), starPhase = new Float32Array(starCount), starColor = new Float32Array(starCount * 3);
    const band = new THREE.Vector3(0.35, 1, 0.2).normalize(); // 은하수 띠의 축
    const tmpV = new THREE.Vector3();
    for (let i = 0; i < starCount; i++) {
      const inBand = i > 2400;
      tmpV.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
      // 띠 별은 축에 수직인 평면 가까이로 모아요
      if (inBand) tmpV.addScaledVector(band, -tmpV.dot(band) * (0.85 + Math.random() * 0.15)).normalize();
      tmpV.multiplyScalar(22);
      starPos.set([tmpV.x, tmpV.y, tmpV.z], i * 3);
      const bright = Math.random() < 0.04;
      starSize[i] = inBand ? 0.7 + Math.random() * 0.9 : bright ? 2.4 + Math.random() * 1.6 : 0.8 + Math.random() * 1.4;
      starPhase[i] = Math.random();
      const warm = Math.random();
      starColor.set(warm < 0.15 ? [1, 0.86, 0.72] : warm < 0.35 ? [0.75, 0.84, 1] : [1, 1, 1], i * 3);
    }
    const starGeo = track(new THREE.BufferGeometry());
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("aSize", new THREE.BufferAttribute(starSize, 1));
    starGeo.setAttribute("aPhase", new THREE.BufferAttribute(starPhase, 1));
    starGeo.setAttribute("aColor", new THREE.BufferAttribute(starColor, 3));
    const starMat = track(new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uFade: { value: 1 }, uPR: { value: renderer.getPixelRatio() } },
      vertexShader: "attribute float aSize; attribute float aPhase; attribute vec3 aColor; uniform float uTime, uFade, uPR; varying float vA; varying vec3 vC;" +
        "void main(){ float sp = 0.18 + aPhase * 0.25; vec3 drift = vec3(sin(uTime * sp + aPhase * 31.), cos(uTime * sp * 0.8 + aPhase * 17.), sin(uTime * sp * 0.6 + aPhase * 7.)) * (0.12 + aPhase * 0.18); gl_Position = projectionMatrix * modelViewMatrix * vec4(position + drift, 1.); float tw = 0.6 + 0.4 * sin(uTime * (0.8 + aPhase * 1.6) + aPhase * 40.); vA = tw * uFade; vC = aColor; gl_PointSize = aSize * uPR * 2.6; }",
      fragmentShader: "varying float vA; varying vec3 vC; void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .05, d); gl_FragColor = vec4(vC, a * vA); }",
    }));
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 별똥별: 가끔 하나씩 하늘을 가로질러요
    const meteorGeo = track(new THREE.BufferGeometry());
    meteorGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    meteorGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array([1, 1, 1, 0.05, 0.08, 0.15]), 3));
    const meteorMat = track(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    const meteor = new THREE.Line(meteorGeo, meteorMat);
    meteor.visible = false;
    scene.add(meteor);
    const shot = { start: 3, dur: 0.9, gap: 4, from: new THREE.Vector3(), dir: new THREE.Vector3() };
    const launch = (t: number) => {
      shot.start = t;
      shot.dur = 0.7 + Math.random() * 0.5;
      shot.gap = 5 + Math.random() * 6;
      shot.from.set((Math.random() - 0.5) * 16, 3 + Math.random() * 5, -12);
      shot.dir.set(-(0.6 + Math.random() * 0.6) * Math.sign(shot.from.x || 1), -(0.35 + Math.random() * 0.4), 0).normalize();
    };

    const spin = new THREE.Group();
    const tilt = new THREE.Group();
    tilt.add(spin);
    scene.add(tilt);
    const home = toVec(...DAEGU);
    // 이 각도면 대구가 화면 정중앙에 와요
    const homeY = Math.atan2(-home.x, home.z);
    const homeX = THREE.MathUtils.degToRad(DAEGU[0]);


    spin.add(new THREE.Mesh(track(new THREE.SphereGeometry(R, 96, 96)), track(new THREE.MeshBasicMaterial({ color: 0x111418 }))));

    const atmoMat = track(new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { c: { value: new THREE.Color(0x9fb6e0) }, k: { value: 1 } },
      vertexShader: "varying vec3 n; void main(){ n = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }",
      fragmentShader: "uniform vec3 c; uniform float k; varying vec3 n; void main(){ float i = pow(clamp(-n.z * 2.2, 0., 1.), 2.); gl_FragColor = vec4(c, i * 0.45 * k); }",
    }));
    scene.add(new THREE.Mesh(track(new THREE.SphereGeometry(R * 1.12, 64, 64)), atmoMat));

    const dotMap = track(dotTexture());
    const worldGeo = track(new THREE.BufferGeometry());
    worldGeo.setAttribute("position", new THREE.BufferAttribute(worldDots(26000), 3));
    const worldMat = track(new THREE.PointsMaterial({ size: 0.017, map: dotMap, transparent: true, alphaTest: 0.3, color: 0xe8e4da }));
    const worldPoints = new THREE.Points(worldGeo, worldMat);
    spin.add(worldPoints);

    const krGeo = track(new THREE.BufferGeometry());
    krGeo.setAttribute("position", new THREE.BufferAttribute(koreaDots(), 3));
    const krMat = track(new THREE.PointsMaterial({ size: 0.0008, map: dotMap, transparent: true, depthWrite: false, opacity: 0, color: 0xffffff }));
    const krPoints = new THREE.Points(krGeo, krMat);
    krPoints.visible = false;
    spin.add(krPoints);

    // 대구 핀
    const pinGroup = new THREE.Group();
    pinGroup.position.copy(home.clone().multiplyScalar(1.0008));
    pinGroup.quaternion.setFromUnitVectors(Z, home.clone().normalize());
    spin.add(pinGroup);
    const blue = 0x3182f6;
    const blueLight = 0x64a8ff;
    const ringGeo = track(new THREE.RingGeometry(0.6, 1, 48));
    const ring = new THREE.Mesh(ringGeo, track(new THREE.MeshBasicMaterial({ color: blue, side: THREE.DoubleSide })));
    const pulseMat = track(new THREE.MeshBasicMaterial({ color: blueLight, side: THREE.DoubleSide, transparent: true }));
    const pulse = new THREE.Mesh(ringGeo, pulseMat);
    const core = new THREE.Mesh(track(new THREE.CircleGeometry(0.32, 24)), track(new THREE.MeshBasicMaterial({ color: blue })));
    pinGroup.add(ring, pulse, core);

    // 구름: 대구 상공 여러 고도에 흩어 놓아요. 카메라가 내려가면 원근으로 점점 커지며 지나가요.
    // clicktorelease css3dclouds처럼 한 덩이를 둥근 퍼프 여러 장으로 쌓아요. 가운데 퍼프는 높고 밝게, 가장자리는 낮고 그늘지게 두면
    // 위에서 내려다볼 때 봉긋한 뭉게구름이 되고, 카메라가 내려가면 겹마다 시차가 생겨 입체로 보여요.
    const cloudMaps = [11, 97, 433, 2027].map((k) => track(puffTexture(k)));
    const t1 = new THREE.Vector3().crossVectors(home, new THREE.Vector3(0, 1, 0)).normalize();
    const t2 = new THREE.Vector3().crossVectors(t1, home).normalize();
    let seed = 5;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const clouds = Array.from({ length: 70 }, () => {
      const h = 0.03 * Math.pow(16, rand()); // 고도 0.03 ~ 0.48 (로그 분포)
      const minR = h < 0.22 ? 0.55 : 0.1; // 낮은 구름은 대구 주변을 비워 착륙 지점이 보여요
      const rr = (minR + Math.sqrt(rand()) * (1 - minR)) * (0.05 + h * 1.1);
      const a = rand() * Math.PI * 2;
      const pos = home.clone().normalize().add(t1.clone().multiplyScalar(Math.cos(a) * rr)).add(t2.clone().multiplyScalar(Math.sin(a) * rr)).normalize();
      const size = h * (0.3 + rand() * 0.35) + 0.004;
      const stretch = 1.2 + rand() * 0.8; // 옆으로 길쭉한 정도
      const dome = size * 0.45;
      const layers = Array.from({ length: 7 + Math.floor(rand() * 6) }, () => {
        const q = Math.sqrt(rand()), pa = rand() * Math.PI * 2; // 타원 안 위치, q=1이 가장자리
        const up = (1 - q) * dome * (0.5 + rand() * 0.5);
        const mat = track(new THREE.SpriteMaterial({ map: cloudMaps[Math.floor(rand() * 4)], transparent: true, depthWrite: false, opacity: 0, rotation: rand() * Math.PI * 2 }));
        const sp = new THREE.Sprite(mat);
        sp.scale.setScalar(size * (0.45 + (1 - q) * 0.45 + rand() * 0.2));
        sp.position.copy(pos).multiplyScalar(R + h + up)
          .addScaledVector(t1, Math.cos(pa) * q * size * 0.55 * stretch).addScaledVector(t2, Math.sin(pa) * q * size * 0.45);
        sp.renderOrder = 2;
        spin.add(sp);
        return { sp, mat, shade: 0.7 + 0.3 * (up / dome), spin: (rand() - 0.5) * 0.08 };
      });
      // rank: 날씨가 맑을수록 rank가 높은 구름부터 사라져요
      return { layers, h, size, rank: rand() * 0.9, base: (h < 0.22 ? 0.6 : 0.9) + rand() * 0.1 };
    });

    // 착륙 구름층: 대구 위를 넓게 덮는 두꺼운 구름. 내려가면 윗면이 다가오고, 퍼프 사이를 지나며 하얗게 덮여요.
    const deck = Array.from({ length: 170 }, () => {
      const rr = Math.sqrt(rand()) * 0.2, a = rand() * Math.PI * 2;
      const pos = home.clone().normalize().add(t1.clone().multiplyScalar(Math.cos(a) * rr)).add(t2.clone().multiplyScalar(Math.sin(a) * rr)).normalize();
      const u = (rand() + rand()) / 2; // 가운데 고도에 빽빽하게
      const h = DECK_LO + (DECK_HI - DECK_LO) * u;
      const size = 0.03 + rand() * 0.045;
      const mat = track(new THREE.SpriteMaterial({ map: cloudMaps[Math.floor(rand() * 4)], transparent: true, depthWrite: false, opacity: 0, rotation: rand() * Math.PI * 2 }));
      const sp = new THREE.Sprite(mat);
      sp.scale.set(size * (1.2 + rand() * 0.6), size, 1);
      sp.position.copy(pos).multiplyScalar(R + h);
      sp.renderOrder = 2;
      sp.visible = false;
      spin.add(sp);
      return { sp, mat, size, shade: 0.8 + 0.2 * u, spin: (rand() - 0.5) * 0.06 };
    });
    // 구름 속: 카메라 바로 앞을 흰 막으로 덮어요. 다음 섹션의 흰 바탕과 이어져요.
    const whiteMat = track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
    const white = new THREE.Mesh(track(new THREE.PlaneGeometry(2, 2)), whiteMat);
    white.position.z = -0.02;
    white.renderOrder = 10;
    white.visible = false;
    camera.add(white);

    // 대구 날씨: 받기 전이나 실패하면 구름 조금인 하늘이에요
    const wx: Look = { cover: 0.6, dark: 0, rain: 0 };

    // 비: 카메라 바로 앞에 빗줄기를 그려요. 구름층 아래로 내려오면 보여요.
    const DROPS = 700;
    const drops = Float32Array.from({ length: DROPS * 3 }, (_, i) => (i % 3 === 2 ? 0.03 + Math.random() * 0.12 : Math.random() * 2 - 1)); // 화면 x, y와 깊이
    const rainGeo = track(new THREE.BufferGeometry());
    rainGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(DROPS * 6), 3));
    const rainMat = track(new THREE.LineBasicMaterial({ color: 0xc4d2e4, transparent: true, opacity: 0, depthWrite: false }));
    const rain = new THREE.LineSegments(rainGeo, rainMat);
    rain.frustumCulled = false;
    rain.visible = false;
    camera.add(rain);
    scene.add(camera);

    // 노선
    const planeGeo = track(new THREE.ConeGeometry(0.014, 0.05, 3));
    planeGeo.rotateX(Math.PI / 2);
    const planeMat = track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
    const lineMat = track(new THREE.LineBasicMaterial({ color: blueLight, transparent: true, opacity: 0.6 }));
    const flights = ROUTES.map(([lat, lon], i) => {
      const to = toVec(lat, lon);
      const mid = home.clone().add(to).multiplyScalar(0.5).setLength(R + 0.25 + home.distanceTo(to) * 0.32);
      const curve = new THREE.QuadraticBezierCurve3(home.clone(), mid, to);
      const geo = track(new THREE.BufferGeometry().setFromPoints(curve.getPoints(90)));
      geo.setDrawRange(0, 0);
      const line = new THREE.Line(geo, lineMat);
      const plane = new THREE.Mesh(planeGeo, planeMat);
      spin.add(line, plane);
      return { curve, geo, line, plane, offset: i * 0.13, speed: 0.07 + (i % 3) * 0.015 };
    });

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const lean = { x: 0, y: 0 };
    const toX = gsap.quickTo(lean, "x", { duration: 1.2, ease: "power3" });
    const toY = gsap.quickTo(lean, "y", { duration: 1.2, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      toX((e.clientY / innerHeight - 0.5) * 0.3);
      toY((e.clientX / innerWidth - 0.5) * 0.5);
    };
    addEventListener("pointermove", onMove);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const v = new THREE.Vector3(), ahead = new THREE.Vector3(), screen = new THREE.Vector3();
    const clock = new THREE.Clock();
    let last = 0;
    renderer.setAnimationLoop(() => {
      if (!visible) return;
      const t = clock.getElapsedTime();
      const dt = Math.min(t - last, 0.05);
      last = t;
      const p = Math.min(zoom.current ?? 0, 1);
      const land = Math.min(Math.max((zoom.current ?? 0) - 1, 0), 1);

      // 대구를 정면으로 돌리면서 고도를 낮춰요
      const face = smooth(0, 0.45, p);
      const dive = smooth(0.15, 1, p);
      const drift = reduce ? 0 : Math.sin(t * 0.12) * 0.5 - 0.25;
      spin.rotation.y = homeY + (drift + lean.y) * (1 - face);
      tilt.rotation.x = THREE.MathUtils.lerp(0.42 + lean.x, homeX, face);
      // 확대가 끝나면 이어서 구름층 속으로 내려가요(로그 보간이라 가까울수록 천천히 다가와요)
      const alt = land > 0 ? ALT_NEAR * Math.pow(ALT_END / ALT_NEAR, land) : ALT_FAR * Math.pow(ALT_NEAR / ALT_FAR, dive);
      camera.position.set(0, 0, R + alt);

      // 가까워지면 세계 점 → 한반도 고해상도 점
      // 점 간격은 고정이라 가까워질수록 점을 작게 해서 뭉개지지 않게 해요
      worldMat.size = 0.017 * Math.min(1, Math.max(alt / 3.2, 0.12));
      const near = smooth(0.6, 0.3, alt);
      worldMat.opacity = 1 - smooth(0.55, 0.3, alt);
      worldPoints.visible = worldMat.opacity > 0.01;
      krMat.opacity = near;
      krPoints.visible = near > 0.01;
      atmoMat.uniforms.k.value = 1 - near;

      // 핀은 화면에서 비슷한 크기로
      pinGroup.scale.setScalar(Math.max(alt, 0.05) * 0.0075);
      const k = reduce ? 0.5 : (t * 0.9) % 2;
      pulse.scale.setScalar(1 + k * 2.4);
      pulseMat.opacity = Math.max(0, 1 - k);

      // 확대가 시작되면 작은 구름이 보이기 시작하고, 카메라가 가까이 지나가면 흩어져요
      const appear = smooth(1.8, 0.9, alt);
      const goal = sky?.current;
      if (goal) {
        wx.cover += (goal.cover - wx.cover) * 0.04;
        wx.dark += (goal.dark - wx.dark) * 0.04;
        wx.rain += (goal.rain - wx.rain) * 0.04;
      }
      const tint = 1 - wx.dark * 0.5; // 비가 오면 회색 먹구름
      for (const c of clouds) {
        const gap = alt - c.h; // 카메라와 구름층 사이 높이
        const o = gap <= 0 ? 0 : appear * c.base * smooth(0, c.size * 1.4, gap) * smooth(c.rank, c.rank + 0.1, wx.cover);
        for (const l of c.layers) {
          l.mat.opacity = o;
          l.sp.visible = o > 0.01;
          if (!reduce) l.mat.rotation += l.spin * dt; // 퍼프마다 아주 천천히 돌아요
          const k = l.shade * tint;
          l.mat.color.setRGB(k, k, Math.min(1, k * 1.05)); // 그늘은 살짝 푸르게
        }
      }

      const deckIn = smooth(0, 0.2, land);
      for (const d of deck) {
        // 카메라가 퍼프를 뚫고 지날 때 커다란 얼룩으로 번쩍이지 않게 아주 가까운 퍼프는 옅게 해요
        const o = deckIn * 0.95 * smooth(d.size * 0.15, d.size * 0.6, camera.position.distanceTo(d.sp.getWorldPosition(v)));
        d.mat.opacity = o;
        d.sp.visible = o > 0.01;
        if (!d.sp.visible) continue;
        if (!reduce) d.mat.rotation += d.spin * dt;
        const k = d.shade * tint;
        d.mat.color.setRGB(k, k, Math.min(1, k * 1.05));
      }
      whiteMat.opacity = land > 0 ? smooth(DECK_HI - 0.005, ALT_END + 0.01, alt) : 0;
      white.visible = whiteMat.opacity > 0.001;
      if (white.visible) {
        const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.02;
        white.scale.set(hh * camera.aspect * 1.05, hh * 1.05, 1);
      }

      rainMat.opacity = wx.rain * 0.5 * smooth(0.9, 0.4, alt);
      rain.visible = rainMat.opacity > 0.01;
      if (rain.visible) {
        const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), hw = hh * camera.aspect;
        const pos = rainGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < DROPS; i++) {
          const d = drops[i * 3 + 2], near = (0.15 - d) / 0.12; // 가까운 빗줄기일수록 빠르고 길어요
          let y = drops[i * 3 + 1];
          if (!reduce) y -= dt * (1.6 + near * 2.4);
          if (y < -1.2) y += 2.4;
          drops[i * 3 + 1] = y;
          const x = drops[i * 3] * hw * d, len = (0.06 + near * 0.1) * hh * d;
          pos.setXYZ(i * 2, x, y * hh * d, -d);
          pos.setXYZ(i * 2 + 1, x + len * 0.15, y * hh * d + len, -d);
        }
        pos.needsUpdate = true;
      }

      const routes = 1 - smooth(0.05, 0.35, p);
      lineMat.opacity = 0.5 * routes;
      planeMat.opacity = routes;
      for (const f of flights) {
        const cyc = reduce ? 1 : (t * f.speed + f.offset) % 1.4;
        const q = Math.min(cyc, 1);
        f.line.visible = routes > 0.01;
        f.geo.setDrawRange(0, Math.floor(q * 91));
        f.plane.visible = routes > 0.01 && cyc < 1;
        if (f.plane.visible) {
          f.curve.getPoint(q, v);
          f.curve.getPoint(Math.min(q + 0.01, 1), ahead);
          f.plane.position.copy(v);
          f.plane.quaternion.setFromUnitVectors(Z, ahead.sub(v).normalize());
        }
      }

      starMat.uniforms.uTime.value = t;
      // 별똥별 진행: 5~11초마다 하나
      const mk = (t - shot.start) / shot.dur;
      if (mk > 1 && !reduce && t - shot.start > shot.dur + shot.gap) launch(t);
      meteor.visible = mk >= 0 && mk <= 1 && starMat.uniforms.uFade.value > 0.05;
      if (meteor.visible) {
        const head = shot.from.clone().addScaledVector(shot.dir, mk * 9);
        const tail = head.clone().addScaledVector(shot.dir, -2.2 * Math.sin(Math.PI * Math.min(mk * 1.4, 1)));
        const pos = meteorGeo.attributes.position as THREE.BufferAttribute;
        pos.setXYZ(0, head.x, head.y, head.z);
        pos.setXYZ(1, tail.x, tail.y, tail.z);
        pos.needsUpdate = true;
        meteorMat.opacity = Math.sin(Math.PI * mk) * starMat.uniforms.uFade.value;
      }
      starMat.uniforms.uFade.value = smooth(0.9, 1.6, alt); // 고도가 높을수록(우주) 1
      stars.visible = starMat.uniforms.uFade.value > 0.01;
      stars.rotation.set(lean.x * 0.15 + Math.sin(t * 0.05) * 0.02, lean.y * 0.15 + t * 0.012, 0); // 느린 공전과 시차

      renderer.render(scene, camera);

      if (label?.current) {
        pinGroup.getWorldPosition(screen).project(camera);
        label.current.style.transform = `translate(${((screen.x + 1) / 2) * el.clientWidth}px, ${((1 - screen.y) / 2) * el.clientHeight}px)`;
      }
    });

    return () => {
      renderer.setAnimationLoop(null);
      removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [zoom, label, sky]);

  return <div ref={host} className={className} aria-hidden />;
}

/** 캔버스 가운데에 글을 그려 두었다가, 왼쪽부터 모래알로 부서져 오른쪽 위로 흩날려 사라지게 해요. */
export type SandLine = { text: string; size: number; weight: number; alpha: number; gap?: number };

export function sandText(canvas: HTMLCanvasElement, lines: SandLine[], family = "Pretendard, sans-serif") {
  const dpr = Math.min(devicePixelRatio, 2);
  const W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // 원본 글자: 따로 그려 두고 아직 부서지지 않은 부분은 이걸 그대로 보여 줘요
  const src = document.createElement("canvas");
  src.width = canvas.width;
  src.height = canvas.height;
  const s = src.getContext("2d")!;
  s.scale(dpr, dpr);
  s.textAlign = "center";
  s.textBaseline = "middle";
  const total = lines.reduce((h, l) => h + l.size * 1.25 + (l.gap ?? 0), 0);
  let y = (H - total) / 2;
  for (const l of lines) {
    y += l.gap ?? 0;
    s.font = `${l.weight} ${l.size}px ${family}`;
    s.fillStyle = `rgba(255,255,255,${l.alpha})`;
    s.fillText(l.text, W / 2, y + (l.size * 1.25) / 2);
    y += l.size * 1.25;
  }
  ctx.drawImage(src, 0, 0, W, H);

  const blow = (sweep = 1.1) => {
    const img = s.getImageData(0, 0, src.width, src.height).data;
    const STEP = 1.5; // 모래알 간격(px). 작을수록 곱지만 알갱이 수가 제곱으로 늘어요
    const ps: { x: number; y: number; a: number; d: number; vx: number; vy: number; life: number; ph: number }[] = [];
    let minX = W, maxX = 0;
    for (let py = 0; py < H; py += STEP) {
      for (let px = 0; px < W; px += STEP) {
        const a = img[(Math.round(py * dpr) * src.width + Math.round(px * dpr)) * 4 + 3];
        if (a < 40) continue;
        minX = Math.min(minX, px);
        maxX = Math.max(maxX, px);
        ps.push({ x: px, y: py, a: a / 255, d: 0, vx: 30 + Math.random() * 110, vy: -(15 + Math.random() * 70), life: 0.9 + Math.random() * 0.9, ph: Math.random() * 6.28 });
      }
    }
    const span = Math.max(1, maxX - minX);
    for (const p of ps) p.d = ((p.x - minX) / span) * sweep + Math.random() * 0.25; // 왼쪽부터 차례로 부서져요

    const t0 = performance.now();
    ctx.fillStyle = "#fff";
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      // 부서지는 경계 오른쪽은 원본을 그대로
      const front = minX + (t / sweep) * span;
      if (front < maxX + STEP) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(front, 0, W - front, H);
        ctx.clip();
        ctx.drawImage(src, 0, 0, W, H);
        ctx.restore();
      }
      let alive = false;
      for (const p of ps) {
        if (p.x >= front) { alive = true; continue; }
        const k = t - p.d;
        const f = k / p.life;
        if (f >= 1) continue;
        alive = true;
        if (k <= 0) {
          ctx.globalAlpha = p.a;
          ctx.fillRect(p.x, p.y, STEP, STEP);
          continue;
        }
        // 바람에 실려 점점 빨라지며 흔들려요
        const x = p.x + p.vx * k + 70 * k * k;
        const yy = p.y + p.vy * k + Math.sin(k * 4 + p.ph) * 6 * k;
        const size = STEP * (1 - f * 0.7);
        ctx.globalAlpha = p.a * (1 - f) * (1 - f);
        ctx.fillRect(x, yy, size, size);
      }
      ctx.globalAlpha = 1;
      if (alive) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    };
    requestAnimationFrame(frame);
  };

  return { blow };
}

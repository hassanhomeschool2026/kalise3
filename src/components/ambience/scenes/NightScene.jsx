// Cinematic night sky — Milky Way, shooting stars, slow drifting clouds, rolling hills
export function initNight(w, h) {
  return {
    t: 0,
    stars: Array.from({ length: 160 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.68,
      r: 0.3 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.8,
      color: Math.random() > 0.85 ? [200, 210, 255] : [255, 255, 255],
    })),
    clouds: Array.from({ length: 3 }, (_, i) => ({
      x: (w / 3) * i * 1.2,
      y: h * (0.12 + i * 0.06),
      w: 90 + Math.random() * 120,
      alpha: 0.04 + Math.random() * 0.06,
      speed: 0.06 + Math.random() * 0.08,
    })),
    shootingStar: null,
    nextShoot: 200 + Math.random() * 400,
    milkyWayOffset: 0,
  };
}

export function drawNight(ctx, w, h, state) {
  ctx.clearRect(0, 0, w, h);
  const { t } = state;

  // Deep space bg
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#020306");
  sky.addColorStop(0.5, "#04060f");
  sky.addColorStop(0.72, "#060c12");
  sky.addColorStop(1, "#03080a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Milky Way band
  for (let i = 0; i < 12; i++) {
    const bx = w * 0.15 + i * (w * 0.065) + Math.sin(i * 0.6) * 20 + state.milkyWayOffset;
    const by = h * 0.08 + Math.sin(i * 0.5) * h * 0.18;
    const mg = ctx.createRadialGradient(bx, by, 0, bx, by, 38);
    mg.addColorStop(0, "rgba(160,170,220,0.055)");
    mg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = mg;
    ctx.fillRect(0, 0, w, h);
  }

  // Stars
  state.stars.forEach((s) => {
    const twinkle = 0.45 + Math.sin(t * s.speed + s.phase) * 0.55;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * twinkle, 0, Math.PI * 2);
    const [r, g, b] = s.color;
    ctx.fillStyle = `rgba(${r},${g},${b},${twinkle * 0.92})`;
    ctx.fill();
  });

  // Shooting star
  state.nextShoot--;
  if (state.nextShoot <= 0 && !state.shootingStar) {
    state.shootingStar = {
      x: Math.random() * w * 0.7,
      y: Math.random() * h * 0.35,
      vx: 4 + Math.random() * 6,
      vy: 2 + Math.random() * 3,
      life: 1,
      len: 80 + Math.random() * 60,
    };
    state.nextShoot = 300 + Math.random() * 500;
  }
  if (state.shootingStar) {
    const ss = state.shootingStar;
    ctx.beginPath();
    ctx.moveTo(ss.x, ss.y);
    ctx.lineTo(ss.x - ss.vx * (ss.len / 8), ss.y - ss.vy * (ss.len / 8));
    const ssGrad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 10, ss.y - ss.vy * 10);
    ssGrad.addColorStop(0, `rgba(255,255,255,${ss.life * 0.9})`);
    ssGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = ssGrad;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ss.x += ss.vx;
    ss.y += ss.vy;
    ss.life -= 0.04;
    if (ss.life <= 0) state.shootingStar = null;
  }

  // Drifting clouds
  state.clouds.forEach((c) => {
    c.x += c.speed;
    if (c.x > w + c.w) c.x = -c.w;
    for (let b = 0; b < 5; b++) {
      const bx = c.x + b * (c.w * 0.22);
      const by = c.y + Math.sin(b * 1.1) * 12;
      const cr = 22 + Math.sin(b) * 8;
      const cg = ctx.createRadialGradient(bx, by, 4, bx, by, cr);
      cg.addColorStop(0, `rgba(60,70,100,${c.alpha * 1.4})`);
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(bx, by, cr, 0, Math.PI * 2); ctx.fill();
    }
  });

  // Moon
  const moonX = w * 0.76, moonY = h * 0.16;
  const aura = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 70);
  aura.addColorStop(0, "rgba(230,225,200,0.14)");
  aura.addColorStop(0.5, "rgba(180,200,230,0.04)");
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura; ctx.fillRect(moonX - 70, moonY - 70, 140, 140);
  ctx.beginPath(); ctx.arc(moonX, moonY, 16, 0, Math.PI * 2);
  const mf = ctx.createRadialGradient(moonX - 3, moonY - 3, 2, moonX, moonY, 16);
  mf.addColorStop(0, "rgba(248,245,225,1)");
  mf.addColorStop(1, "rgba(215,210,185,0.88)");
  ctx.fillStyle = mf; ctx.fill();

  // Silhouette hills
  for (let layer = 0; layer < 2; layer++) {
    const yOff = layer * h * 0.06;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 5) {
      const y = h * (0.72 + layer * 0.04)
        + Math.sin(x * 0.007 + layer * 1.5) * h * 0.08
        + Math.sin(x * 0.018 + layer) * h * 0.03;
      ctx.lineTo(x, y + yOff);
    }
    ctx.lineTo(w, h); ctx.closePath();
    ctx.fillStyle = layer === 0 ? "rgba(4,8,6,0.95)" : "rgba(3,6,4,1)";
    ctx.fill();
  }

  state.milkyWayOffset += 0.01;
  state.t += 0.012;
}
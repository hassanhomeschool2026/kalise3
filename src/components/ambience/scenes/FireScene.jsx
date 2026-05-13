// Cinematic fireplace — realistic physics fire, warm ember glow, flickering room light
export function initFire(w, h) {
  const particles = Array.from({ length: 120 }, (_, i) => ({
    x: w * 0.5 + (Math.random() - 0.5) * w * 0.22,
    y: h * 0.72,
    vx: (Math.random() - 0.5) * 1.2,
    vy: -(1.8 + Math.random() * 3.5),
    life: Math.random(),
    maxLife: 0.6 + Math.random() * 0.4,
    size: 5 + Math.random() * 14,
    turbulence: (Math.random() - 0.5) * 0.04,
  }));
  const embers = Array.from({ length: 28 }, () => ({
    x: w * 0.5 + (Math.random() - 0.5) * w * 0.2,
    y: h * 0.72 + Math.random() * 10,
    vx: (Math.random() - 0.5) * 1.8,
    vy: -(0.5 + Math.random() * 2.5),
    life: Math.random(),
    size: 1 + Math.random() * 2.5,
  }));
  return { particles, embers, t: 0, flicker: 1 };
}

export function drawFire(ctx, w, h, state) {
  // Dark room
  ctx.fillStyle = `rgba(6,3,1,${0.18 + Math.random() * 0.04})`;
  ctx.fillRect(0, 0, w, h);

  const { t } = state;
  const cx = w * 0.5;
  const fireY = h * 0.72;

  // Fireplace mantle / opening (dark arch)
  ctx.fillStyle = "#0a0600";
  ctx.beginPath();
  ctx.ellipse(cx, fireY + 18, w * 0.26, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#060400";
  ctx.fillRect(cx - w * 0.26, fireY - 5, w * 0.52, 38);

  // Warm floor glow
  const floorGlow = ctx.createRadialGradient(cx, fireY + 20, 5, cx, fireY + 20, w * 0.55);
  floorGlow.addColorStop(0, `rgba(255,90,0,${0.12 + Math.sin(t * 3) * 0.02})`);
  floorGlow.addColorStop(0.5, `rgba(255,50,0,${0.05 + Math.sin(t * 2.5) * 0.01})`);
  floorGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = floorGlow;
  ctx.fillRect(0, h * 0.4, w, h * 0.6);

  // Room ambient warm light on walls
  const roomGlow = ctx.createRadialGradient(cx, fireY, 10, cx, fireY, w * 0.9);
  roomGlow.addColorStop(0, `rgba(255,120,20,${0.07 + Math.sin(t * 1.8) * 0.02})`);
  roomGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = roomGlow;
  ctx.fillRect(0, 0, w, h);

  // Logs
  ctx.fillStyle = "#2a1000";
  ctx.beginPath(); ctx.ellipse(cx - 12, fireY + 14, 35, 9, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1e0c00";
  ctx.beginPath(); ctx.ellipse(cx + 10, fireY + 18, 32, 8, 0.15, 0, Math.PI * 2); ctx.fill();
  // Bark texture highlights
  ctx.strokeStyle = "rgba(80,30,0,0.5)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(cx - 12, fireY + 14, 35, 9, -0.2, 0.3, 2.8); ctx.stroke();

  // FIRE PARTICLES — with heat shimmer blur on upper particles
  state.particles.forEach((p) => {
    p.life += 0.012 + p.turbulence * 0.5;
    if (p.life >= 1) {
      p.life = 0;
      p.x = cx + (Math.random() - 0.5) * w * 0.18;
      p.y = fireY + 5;
      p.vx = (Math.random() - 0.5) * 1.2;
      p.vy = -(1.8 + Math.random() * 3.5);
      p.size = 5 + Math.random() * 14;
    }
    const fl = p.life;
    p.x += p.vx + Math.sin(t * 2.5 + p.turbulence * 100) * 0.6;
    p.y += p.vy;
    p.vy -= 0.04;
    p.vx *= 0.99;

    // Color: white core → yellow → orange → red → transparent
    let r, g, b, a;
    if (fl < 0.15) { r = 255; g = 240; b = 180; a = fl / 0.15 * 0.9; }
    else if (fl < 0.35) { r = 255; g = 200; b = 60; a = 0.9; }
    else if (fl < 0.6) { r = 255; g = 100 * (1 - fl); b = 0; a = 0.8 * (1 - (fl - 0.35) / 0.6); }
    else { r = 200; g = 30; b = 0; a = 0.4 * (1 - fl); }

    const sz = Math.max(0.01, p.size * (1 - fl * 0.6));
    // Upper particles get a soft blur for heat distortion effect
    ctx.filter = fl > 0.55 ? "blur(1.5px)" : fl > 0.35 ? "blur(0.5px)" : "none";
    const fireGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz);
    fireGrad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
    fireGrad.addColorStop(1, `rgba(${r},${Math.floor(g * 0.3)},0,0)`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
    ctx.fillStyle = fireGrad;
    ctx.fill();
  });
  ctx.filter = "none";

  // Embers
  state.embers.forEach((e) => {
    e.life += 0.008;
    if (e.life >= 1) {
      e.life = 0;
      e.x = cx + (Math.random() - 0.5) * w * 0.18;
      e.y = fireY;
      e.vx = (Math.random() - 0.5) * 1.8;
      e.vy = -(0.5 + Math.random() * 2.5);
    }
    e.x += e.vx + Math.sin(t * 3 + e.x) * 0.3;
    e.y += e.vy;
    e.vx *= 0.98;
    const ea = Math.max(0, 1 - e.life * 1.4);
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size * (1 - e.life * 0.5), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,${150 + Math.sin(t * 4 + e.x) * 50},0,${ea * 0.9})`;
    ctx.fill();
  });

  state.t += 0.016;
}
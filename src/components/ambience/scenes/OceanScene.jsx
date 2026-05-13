// Cinematic night ocean — moonlight caustics, layered waves, star shimmer
export function initOcean(w, h) {
  return {
    t: 0,
    stars: Array.from({ length: 90 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.48,
      r: 0.4 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
    })),
    caustics: Array.from({ length: 16 }, () => ({
      x: Math.random() * w,
      y: h * 0.52 + Math.random() * h * 0.4,
      r: 4 + Math.random() * 8,
      phase: Math.random() * Math.PI * 2,
    })),
    foam: Array.from({ length: 30 }, () => ({
      x: Math.random() * w,
      y: h * 0.5 + Math.random() * 25,
      size: 2 + Math.random() * 5,
      alpha: Math.random() * 0.4,
      speed: 0.2 + Math.random() * 0.4,
    })),
  };
}

export function drawOcean(ctx, w, h, state) {
  ctx.clearRect(0, 0, w, h);
  const { t } = state;

  // Sky — deep navy
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.52);
  sky.addColorStop(0, "#020810");
  sky.addColorStop(0.6, "#071428");
  sky.addColorStop(1, "#0d2040");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.52);

  // Atmospheric haze band
  const haze = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.52);
  haze.addColorStop(0, "rgba(20,50,100,0)");
  haze.addColorStop(1, "rgba(20,50,100,0.18)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, h * 0.3, w, h * 0.22);

  // Stars — with glow halos for realism
  state.stars.forEach((s) => {
    const twinkle = 0.55 + Math.sin(t * s.speed + s.phase) * 0.45;
    const radius = Math.max(0.01, s.r * twinkle);
    if (s.r > 0.8) {
      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, radius * 5);
      glow.addColorStop(0, `rgba(220,230,255,${twinkle * 0.2})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(s.x, s.y, radius * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,230,255,${twinkle * 0.85})`;
    ctx.fill();
  });

  // Moon glow aura
  const moonX = w * 0.72, moonY = h * 0.14;
  const moonAura = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 90);
  moonAura.addColorStop(0, "rgba(240,238,220,0.18)");
  moonAura.addColorStop(0.4, "rgba(180,200,230,0.06)");
  moonAura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = moonAura;
  ctx.fillRect(moonX - 90, moonY - 90, 180, 180);

  // Moon
  ctx.beginPath();
  ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
  const moonFill = ctx.createRadialGradient(moonX - 4, moonY - 4, 2, moonX, moonY, 18);
  moonFill.addColorStop(0, "rgba(250,248,228,1)");
  moonFill.addColorStop(0.7, "rgba(235,232,200,0.95)");
  moonFill.addColorStop(1, "rgba(210,210,180,0.8)");
  ctx.fillStyle = moonFill;
  ctx.fill();

  // Ocean — 5 wave layers
  for (let layer = 0; layer < 5; layer++) {
    const yBase = h * 0.5 + layer * (h * 0.09);
    const amp = 7 - layer * 0.8;
    const speed = 0.55 - layer * 0.08;
    const lightness = 12 + layer * 6;
    const alpha = 0.75 + layer * 0.05;

    ctx.beginPath();
    ctx.moveTo(-10, yBase);
    for (let x = -10; x <= w + 10; x += 3) {
      const y = yBase
        + Math.sin(x * 0.012 + t * speed) * amp
        + Math.sin(x * 0.027 + t * speed * 1.3 + layer) * (amp * 0.45)
        + Math.sin(x * 0.006 + t * 0.2) * (amp * 0.3);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w + 10, h);
    ctx.lineTo(-10, h);
    ctx.closePath();
    ctx.fillStyle = `hsla(215, 55%, ${lightness}%, ${alpha})`;
    ctx.fill();
  }

  // Moonlight path on water
  const reflPath = ctx.createLinearGradient(moonX - 40, h * 0.5, moonX + 40, h);
  reflPath.addColorStop(0, "rgba(230,228,200,0.0)");
  reflPath.addColorStop(0.4, "rgba(230,228,200,0.09)");
  reflPath.addColorStop(1, "rgba(230,228,200,0.0)");
  ctx.fillStyle = reflPath;
  ctx.beginPath();
  ctx.moveTo(moonX - 10, h * 0.5);
  ctx.lineTo(moonX - 55, h);
  ctx.lineTo(moonX + 55, h);
  ctx.lineTo(moonX + 10, h * 0.5);
  ctx.closePath();
  ctx.fill();

  // Caustic sparkles
  state.caustics.forEach((c) => {
    const pulse = 0.3 + Math.sin(t * 1.2 + c.phase) * 0.3;
    ctx.beginPath();
    ctx.arc(c.x + Math.sin(t * 0.3 + c.phase) * 3, c.y + Math.cos(t * 0.2 + c.phase) * 2, c.r * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,225,255,${pulse * 0.12})`;
    ctx.fill();
  });

  // Foam dots
  state.foam.forEach((f) => {
    f.x += f.speed;
    if (f.x > w + 10) f.x = -5;
    ctx.beginPath();
    ctx.arc(f.x, f.y + Math.sin(t * 0.8 + f.x * 0.01) * 3, f.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,235,255,${f.alpha})`;
    ctx.fill();
  });

  state.t += 0.018;
}
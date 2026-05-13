// Cinematic deep forest — layered parallax trees, god rays, fireflies, drifting mist
export function initForest(w, h) {
  return {
    t: 0,
    fireflies: Array.from({ length: 22 }, () => ({
      x: Math.random() * w,
      y: h * 0.28 + Math.random() * h * 0.45,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.008,
      r: 2.5 + Math.random() * 2,
    })),
    particles: Array.from({ length: 35 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -0.08 - Math.random() * 0.12,
      size: 0.8 + Math.random() * 1.8,
      alpha: 0.1 + Math.random() * 0.25,
    })),
    mist: Array.from({ length: 5 }, (_, i) => ({
      x: (w / 4) * i - 50,
      y: h * 0.55 + Math.random() * h * 0.25,
      w: 120 + Math.random() * 160,
      alpha: 0.04 + Math.random() * 0.06,
      speed: 0.08 + Math.random() * 0.12,
    })),
  };
}

export function drawForest(ctx, w, h, state) {
  ctx.clearRect(0, 0, w, h);
  const { t } = state;

  // Sky gradient through canopy
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#060d08");
  sky.addColorStop(0.4, "#0a1a0e");
  sky.addColorStop(0.7, "#0d2015");
  sky.addColorStop(1, "#071008");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // God rays
  const rayColors = [
    "rgba(200,240,160,0.025)", "rgba(180,230,140,0.018)", "rgba(220,255,180,0.022)"
  ];
  [0.3, 0.5, 0.68].forEach((rx, i) => {
    ctx.save();
    ctx.translate(w * rx, 0);
    ctx.rotate(Math.sin(t * 0.08 + i) * 0.04);
    const rayGrad = ctx.createLinearGradient(0, 0, 0, h * 0.75);
    rayGrad.addColorStop(0, rayColors[i]);
    rayGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rayGrad;
    const rayW = 30 + Math.sin(t * 0.15 + i) * 10;
    ctx.beginPath();
    ctx.moveTo(-rayW / 2, 0);
    ctx.lineTo(-rayW * 2.5, h * 0.75);
    ctx.lineTo(rayW * 2.5, h * 0.75);
    ctx.lineTo(rayW / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // Tree layers (back to front)
  const treeLayers = [
    { count: 7, yBase: 0.5, height: 0.52, width: 0.09, green: [15, 35, 15], alpha: 0.7, swayAmt: 1.2 },
    { count: 6, yBase: 0.58, height: 0.48, width: 0.1, green: [18, 45, 18], alpha: 0.85, swayAmt: 1.8 },
    { count: 5, yBase: 0.65, height: 0.42, width: 0.12, green: [22, 55, 22], alpha: 1, swayAmt: 2.5 },
  ];

  treeLayers.forEach((layer, li) => {
    for (let i = 0; i < layer.count; i++) {
      const xBase = (w / layer.count) * i + (w / layer.count / 2) + li * 13;
      const sway = Math.sin(t * 0.25 + i * 1.3 + li) * layer.swayAmt;
      const treeH = h * layer.height;
      const treeW = w * layer.width;
      const y0 = h * layer.yBase;

      // Trunk
      ctx.fillStyle = `rgba(10,6,3,${layer.alpha})`;
      ctx.fillRect(xBase - 3 + sway * 0.2, y0, 6, treeH * 0.3);

      // Canopy — 3 overlapping triangles per tree
      for (let tier = 0; tier < 3; tier++) {
        const tierY = y0 - tier * treeH * 0.22;
        const tierW = treeW * (1 - tier * 0.18);
        ctx.beginPath();
        ctx.moveTo(xBase + sway, tierY - treeH * 0.45);
        ctx.lineTo(xBase - tierW / 2 + sway * 0.6, tierY + treeH * 0.08);
        ctx.lineTo(xBase + tierW / 2 + sway * 0.6, tierY + treeH * 0.08);
        ctx.closePath();
        const [r, g, b] = layer.green;
        ctx.fillStyle = `rgba(${r},${g + tier * 5},${b},${layer.alpha * (0.8 + tier * 0.1)})`;
        ctx.fill();
      }
    }
  });

  // Ground fog / mist
  state.mist.forEach((m) => {
    m.x += m.speed;
    if (m.x > w + m.w) m.x = -m.w;
    const mg = ctx.createRadialGradient(m.x + m.w / 2, m.y, 0, m.x + m.w / 2, m.y, m.w);
    mg.addColorStop(0, `rgba(160,210,180,${m.alpha})`);
    mg.addColorStop(1, "rgba(160,210,180,0)");
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.ellipse(m.x + m.w / 2, m.y, m.w, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Floating dust particles
  state.particles.forEach((p) => {
    p.x += p.vx + Math.sin(t * 0.3 + p.y * 0.01) * 0.1;
    p.y += p.vy;
    if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,240,200,${p.alpha * (0.5 + Math.sin(t + p.x * 0.02) * 0.5)})`;
    ctx.fill();
  });

  // Fireflies
  state.fireflies.forEach((f) => {
    f.x += Math.sin(t * f.speed + f.phase) * 0.55 + f.drift;
    f.y += Math.cos(t * f.speed * 0.7 + f.phase) * 0.35;
    if (f.x < 0) f.x = w; if (f.x > w) f.x = 0;
    if (f.y < h * 0.2) f.y = h * 0.65; if (f.y > h * 0.75) f.y = h * 0.28;

    const gAlpha = 0.2 + Math.sin(t * 2.5 + f.phase) * 0.7;
    if (gAlpha > 0) {
      const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 4);
      glow.addColorStop(0, `rgba(200,255,120,${Math.max(0, gAlpha * 0.9)})`);
      glow.addColorStop(0.4, `rgba(160,230,80,${Math.max(0, gAlpha * 0.3)})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      // Core dot
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * Math.max(0.1, gAlpha), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,255,150,${Math.max(0, gAlpha)})`;
      ctx.fill();
    }
  });

  state.t += 0.014;
}
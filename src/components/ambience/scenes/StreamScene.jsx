// Cinematic mountain stream — flowing water, mossy rocks, spray mist, ambient forest
export function initStream(w, h) {
  return {
    t: 0,
    foam: Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      y: h * 0.48 + Math.random() * h * 0.45,
      vx: 0.4 + Math.random() * 1.2,
      vy: 0.1 + Math.random() * 0.3,
      r: 1.5 + Math.random() * 3.5,
      alpha: 0.15 + Math.random() * 0.35,
    })),
    spray: Array.from({ length: 20 }, () => ({
      x: w * 0.3 + Math.random() * w * 0.4,
      y: h * 0.48 + Math.random() * 15,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(0.5 + Math.random() * 1.5),
      alpha: 0.4 + Math.random() * 0.4,
      size: 0.8 + Math.random() * 1.8,
    })),
  };
}

export function drawStream(ctx, w, h, state) {
  ctx.clearRect(0, 0, w, h);
  const { t } = state;

  // Forest bg
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#060e08");
  bg.addColorStop(0.45, "#0a1a0d");
  bg.addColorStop(1, "#050d07");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  // Soft sky gap through canopy
  const skyGap = ctx.createEllipse || null;
  const sg = ctx.createRadialGradient(w * 0.5, 0, 0, w * 0.5, 0, h * 0.4);
  sg.addColorStop(0, "rgba(40,80,100,0.25)");
  sg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sg; ctx.fillRect(0, 0, w, h * 0.4);

  // Background trees
  for (let i = 0; i < 8; i++) {
    const tx = (w / 8) * i + w / 16;
    const th = h * (0.3 + Math.sin(i * 1.7) * 0.06);
    const sway = Math.sin(t * 0.2 + i * 1.1) * 2;
    ctx.fillStyle = "rgba(8,18,10,0.9)";
    ctx.beginPath();
    ctx.moveTo(tx + sway, h * 0.44 - th);
    ctx.lineTo(tx - 22 + sway * 0.5, h * 0.44);
    ctx.lineTo(tx + 22 + sway * 0.5, h * 0.44);
    ctx.closePath(); ctx.fill();
  }

  // Stream banks
  ctx.fillStyle = "#0c1a0e";
  ctx.fillRect(0, h * 0.44, w * 0.12, h * 0.56);
  ctx.fillRect(w * 0.88, h * 0.44, w * 0.12, h * 0.56);

  // Water body
  const waterGrad = ctx.createLinearGradient(0, h * 0.44, 0, h);
  waterGrad.addColorStop(0, "#1a3a3a");
  waterGrad.addColorStop(0.5, "#122828");
  waterGrad.addColorStop(1, "#0d1e1e");
  ctx.fillStyle = waterGrad;
  ctx.fillRect(w * 0.12, h * 0.44, w * 0.76, h * 0.56);

  // Water flow lines
  for (let layer = 0; layer < 6; layer++) {
    const fy = h * 0.46 + layer * (h * 0.085);
    ctx.beginPath();
    for (let x = w * 0.12; x <= w * 0.88; x += 4) {
      const y = fy + Math.sin(x * 0.04 + t * (1.8 - layer * 0.2)) * (4 - layer * 0.4)
               + Math.sin(x * 0.018 + t * 0.6) * 2.5;
      if (x === w * 0.12) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(80,170,180,${0.18 - layer * 0.02})`;
    ctx.lineWidth = 1.5 - layer * 0.15;
    ctx.stroke();
  }

  // Light reflections
  for (let r = 0; r < 8; r++) {
    const rx = w * 0.15 + (r / 8) * w * 0.7;
    const ry = h * 0.47 + Math.sin(t * 0.8 + r) * 15;
    const len = 15 + Math.sin(t * 1.5 + r * 0.8) * 8;
    ctx.beginPath();
    ctx.moveTo(rx - len / 2, ry);
    ctx.lineTo(rx + len / 2, ry + 2);
    ctx.strokeStyle = `rgba(160,220,230,${0.12 + Math.sin(t * 2 + r) * 0.06})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Mossy rocks
  const rocks = [[0.28, 0.62], [0.48, 0.56], [0.65, 0.68], [0.22, 0.74], [0.72, 0.58], [0.38, 0.8]];
  rocks.forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(w * rx, h * ry, 16, 10, Math.sin(rx * 5) * 0.4, 0, Math.PI * 2);
    const rg = ctx.createRadialGradient(w * rx - 3, h * ry - 3, 2, w * rx, h * ry, 16);
    rg.addColorStop(0, "hsl(140,15%,30%)");
    rg.addColorStop(1, "hsl(140,10%,16%)");
    ctx.fillStyle = rg; ctx.fill();
    // Moss highlight
    ctx.beginPath();
    ctx.ellipse(w * rx - 3, h * ry - 3, 7, 4, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(60,100,50,0.45)"; ctx.fill();
  });

  // Foam bubbles
  state.foam.forEach((f) => {
    f.x += f.vx;
    f.y += f.vy + Math.sin(t + f.x * 0.02) * 0.2;
    if (f.x > w * 0.9 || f.y > h) { f.x = w * 0.12 + Math.random() * 20; f.y = h * 0.48 + Math.random() * 20; }
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(200,240,245,${f.alpha})`; ctx.lineWidth = 0.8; ctx.stroke();
  });

  // Mist spray — bokeh softness
  state.spray.forEach((s) => {
    s.x += s.vx; s.y += s.vy; s.alpha -= 0.008;
    if (s.alpha <= 0) {
      s.x = w * 0.3 + Math.random() * w * 0.4;
      s.y = h * 0.48; s.vx = (Math.random() - 0.5) * 1.5;
      s.vy = -(0.5 + Math.random() * 1.5); s.alpha = 0.4 + Math.random() * 0.4;
    }
    const bokeh = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
    bokeh.addColorStop(0, `rgba(200,230,240,${s.alpha})`);
    bokeh.addColorStop(1, "rgba(200,230,240,0)");
    ctx.fillStyle = bokeh;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2); ctx.fill();
  });

  state.t += 0.016;
}
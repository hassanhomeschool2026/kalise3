// Cinematic wind chimes — cozy porch, soft lantern glow, curtain sway, chime motion
export function initWind(w, h) {
  return {
    t: 0,
    windPhase: 0,
    windStrength: 0.5,
    nextGust: 80,
    chimes: [0.22, 0.34, 0.46, 0.58, 0.7, 0.82].map((xRatio, i) => ({
      xRatio,
      length: 70 + i * 14 - (i % 3) * 20,
      swingPhase: Math.random() * Math.PI * 2,
      swingSpeed: 0.18 + i * 0.04,
    })),
    particles: Array.from({ length: 25 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0.3 + Math.random() * 0.6,
      alpha: 0.05 + Math.random() * 0.15,
      size: 1 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    })),
    curtainPhase: 0,
  };
}

export function drawWind(ctx, w, h, state) {
  ctx.clearRect(0, 0, w, h);
  const { t } = state;

  // Evening sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#12071e");
  sky.addColorStop(0.45, "#1e0d35");
  sky.addColorStop(0.75, "#2d1245");
  sky.addColorStop(1, "#180830");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

  // Distant city glow on horizon
  const horizonGlow = ctx.createLinearGradient(0, h * 0.6, 0, h * 0.75);
  horizonGlow.addColorStop(0, "rgba(255,140,60,0.06)");
  horizonGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = horizonGlow; ctx.fillRect(0, h * 0.6, w, h * 0.15);

  // Stars
  for (let i = 0; i < 40; i++) {
    const sx = ((i * 137.5) % w);
    const sy = ((i * 73.1) % (h * 0.55));
    const sa = 0.2 + Math.sin(t * 0.5 + i) * 0.15;
    ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,210,255,${sa})`; ctx.fill();
  }

  // Curtain left
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let y = 0; y <= h * 0.85; y += 5) {
    const sway = Math.sin(y * 0.012 + t * 0.4 + state.curtainPhase) * (state.windStrength * 18);
    ctx.lineTo(w * 0.14 + sway, y);
  }
  ctx.lineTo(0, h * 0.85); ctx.closePath();
  const curtainL = ctx.createLinearGradient(0, 0, w * 0.14, 0);
  curtainL.addColorStop(0, "rgba(240,230,215,0.92)");
  curtainL.addColorStop(1, "rgba(220,210,195,0.55)");
  ctx.fillStyle = curtainL; ctx.fill();
  ctx.restore();

  // Curtain right
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(w, 0);
  for (let y = 0; y <= h * 0.85; y += 5) {
    const sway = Math.sin(y * 0.012 + t * 0.4 + state.curtainPhase + Math.PI) * (state.windStrength * 18);
    ctx.lineTo(w * 0.86 + sway, y);
  }
  ctx.lineTo(w, h * 0.85); ctx.closePath();
  const curtainR = ctx.createLinearGradient(w * 0.86, 0, w, 0);
  curtainR.addColorStop(0, "rgba(220,210,195,0.55)");
  curtainR.addColorStop(1, "rgba(240,230,215,0.92)");
  ctx.fillStyle = curtainR; ctx.fill();
  ctx.restore();

  // Lantern — warm glow
  const lanternX = w * 0.5, lanternY = h * 0.08;
  const lanternGlow = ctx.createRadialGradient(lanternX, lanternY + 15, 0, lanternX, lanternY + 15, 110);
  lanternGlow.addColorStop(0, `rgba(255,180,60,${0.22 + Math.sin(t * 1.5) * 0.04})`);
  lanternGlow.addColorStop(0.4, `rgba(255,130,30,${0.08 + Math.sin(t * 2) * 0.02})`);
  lanternGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = lanternGlow; ctx.fillRect(0, 0, w, h * 0.4);

  // Lantern body
  ctx.fillStyle = "rgba(40,20,0,0.9)";
  ctx.fillRect(lanternX - 12, lanternY, 24, 32);
  ctx.fillStyle = `rgba(255,200,80,${0.8 + Math.sin(t * 2) * 0.1})`;
  ctx.fillRect(lanternX - 9, lanternY + 3, 18, 26);
  ctx.fillStyle = "rgba(40,20,0,0.9)";
  for (let bar = 0; bar < 3; bar++) {
    ctx.fillRect(lanternX - 10, lanternY + 3 + bar * 8, 20, 1.5);
  }
  // Hook
  ctx.strokeStyle = "rgba(40,20,0,0.7)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(lanternX, lanternY);
  ctx.bezierCurveTo(lanternX + 5, lanternY - 8, lanternX - 5, lanternY - 14, lanternX, lanternY - 18);
  ctx.stroke();
  // Top bar
  ctx.fillStyle = "rgba(200,180,150,0.6)";
  ctx.fillRect(w * 0.15, lanternY - 20, w * 0.7, 3);
  ctx.strokeStyle = "rgba(180,160,130,0.4)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w * 0.15, lanternY - 18); ctx.lineTo(lanternX, lanternY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.85, lanternY - 18); ctx.lineTo(lanternX, lanternY); ctx.stroke();

  // Wind chimes
  state.chimes.forEach((c) => {
    const cx = w * c.xRatio;
    const topY = lanternY - 18 + 3;
    const swing = Math.sin(t * c.swingSpeed + c.swingPhase + state.windPhase) * (state.windStrength * 14);
    const botX = cx + swing;
    const botY = topY + c.length;

    // String
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.quadraticCurveTo(cx + swing * 0.5, topY + c.length * 0.5, botX, botY);
    ctx.strokeStyle = "rgba(200,185,160,0.5)"; ctx.lineWidth = 0.8; ctx.stroke();

    // Tube
    ctx.save();
    ctx.translate(botX, botY + 11);
    ctx.rotate(swing * 0.015);
    const tubeGrad = ctx.createLinearGradient(-3, 0, 3, 0);
    tubeGrad.addColorStop(0, "rgba(200,185,160,0.9)");
    tubeGrad.addColorStop(0.4, "rgba(235,220,200,0.95)");
    tubeGrad.addColorStop(1, "rgba(180,165,140,0.8)");
    ctx.fillStyle = tubeGrad;
    ctx.fillRect(-2.5, -11, 5, 22);
    ctx.restore();
  });

  // Wind particles
  state.particles.forEach((p) => {
    p.x += p.vx * (0.5 + state.windStrength);
    p.y += Math.sin(t * 0.5 + p.phase) * 0.3;
    if (p.x > w + 5) { p.x = -5; p.y = Math.random() * h; }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,210,255,${p.alpha * (0.5 + state.windStrength * 0.5)})`; ctx.fill();
  });

  // Wind gusts
  state.nextGust--;
  if (state.nextGust <= 0) {
    state.windStrength = 0.4 + Math.random() * 0.8;
    state.windPhase += (Math.random() - 0.5) * 2;
    state.nextGust = 60 + Math.random() * 120;
    setTimeout(() => { state.windStrength = 0.3 + Math.random() * 0.3; }, 1500);
  }

  state.curtainPhase = t * 0.35;
  state.t += 0.014;
}
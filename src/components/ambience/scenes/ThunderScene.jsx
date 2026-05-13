// Cinematic distant thunder — roiling storm clouds, lightning, heavy rain, dark drama
export function initThunder(w, h) {
  return {
    t: 0,
    flash: 0,
    nextFlash: 150 + Math.random() * 250,
    bolt: null,
    rain: Array.from({ length: 140 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 10 + Math.random() * 16,
      speed: 10 + Math.random() * 7,
      alpha: 0.15 + Math.random() * 0.35,
    })),
    cloudOffset: [0, w * 0.3, -w * 0.2, w * 0.6],
    cloudSpeeds: [0.08, 0.06, 0.1, 0.07],
  };
}

function drawBolt(ctx, x, y, w, h, life) {
  const segs = 10;
  let bx = x, by = y;
  ctx.save();
  ctx.strokeStyle = `rgba(210,225,255,${life * 0.95})`;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = "rgba(180,200,255,0.9)";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  for (let i = 0; i < segs; i++) {
    bx += (Math.random() - 0.5) * 28;
    by += (h * 0.55) / segs;
    ctx.lineTo(bx, by);
    // Branch
    if (Math.random() > 0.6 && i > 1) {
      ctx.moveTo(bx, by);
      let bbx = bx, bby = by;
      for (let b = 0; b < 4; b++) {
        bbx += (Math.random() - 0.5) * 18;
        bby += 20;
        ctx.lineTo(bbx, bby);
      }
      ctx.moveTo(bx, by);
    }
  }
  ctx.stroke();
  // Glow layer
  ctx.strokeStyle = `rgba(240,245,255,${life * 0.3})`;
  ctx.lineWidth = 4;
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(bx, by);
  ctx.stroke();
  ctx.restore();
}

export function drawThunder(ctx, w, h, state) {
  const { t } = state;

  // Dark base — don't fully clear to get motion blur effect
  ctx.fillStyle = `rgba(4,5,8,${state.flash > 0 ? 0.1 : 0.22})`;
  ctx.fillRect(0, 0, w, h);

  // Lightning flash illumination
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(200,215,255,${state.flash * 0.12})`;
    ctx.fillRect(0, 0, w, h);
    state.flash -= 0.06;
  }

  // Storm cloud layers
  for (let layer = 0; layer < 4; layer++) {
    state.cloudOffset[layer] = (state.cloudOffset[layer] + state.cloudSpeeds[layer]) % (w * 1.4);
    const xOff = state.cloudOffset[layer] - w * 0.2;
    const yBase = h * (0.05 + layer * 0.1);
    const alpha = 0.75 + layer * 0.06 + (state.flash > 0 ? state.flash * 0.2 : 0);

    for (let ci = -1; ci < 3; ci++) {
      const cx = xOff + ci * (w * 0.5);
      for (let b = 0; b < 7; b++) {
        const bx = cx + b * 35 - 60;
        const by = yBase + Math.sin(b * 0.9 + layer) * 22;
        const cr = 32 + Math.sin(b + layer) * 12;
        const cg = ctx.createRadialGradient(bx, by, 4, bx, by, cr);
        const dark = 12 + layer * 4 + (state.flash > 0 ? state.flash * 20 : 0);
        cg.addColorStop(0, `rgba(${dark + 5},${dark + 8},${dark + 18},${alpha})`);
        cg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.arc(bx, by, cr, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // Rain
  ctx.save();
  state.rain.forEach((r) => {
    ctx.strokeStyle = `rgba(150,175,210,${r.alpha})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x + 1.5, r.y + r.len);
    ctx.stroke();
    r.x += 1.2;
    r.y += r.speed;
    if (r.y > h + r.len) { r.y = -r.len; r.x = Math.random() * w; }
  });
  ctx.restore();

  // Lightning
  state.nextFlash -= 1;
  if (state.nextFlash <= 0 && !state.bolt) {
    state.flash = 1;
    state.nextFlash = 200 + Math.random() * 350;
    state.bolt = {
      x: w * (0.15 + Math.random() * 0.7),
      y: h * 0.03,
      life: 1,
    };
  }

  if (state.bolt) {
    drawBolt(ctx, state.bolt.x, state.bolt.y, w, h, state.bolt.life);
    state.bolt.life -= 0.08;
    if (state.bolt.life <= 0) state.bolt = null;
  }

  // Distant rain veil
  const rainVeil = ctx.createLinearGradient(0, h * 0.35, 0, h);
  rainVeil.addColorStop(0, "rgba(100,130,170,0)");
  rainVeil.addColorStop(0.5, "rgba(80,110,150,0.06)");
  rainVeil.addColorStop(1, "rgba(60,90,130,0.12)");
  ctx.fillStyle = rainVeil; ctx.fillRect(0, h * 0.35, w, h * 0.65);

  state.t += 0.012;
}
// Cinematic rain scene — falling drops, mist, ripple rings on ground fog
export function initRain(w, h) {
  return {
    drops: Array.from({ length: 180 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 8 + Math.random() * 14,
      speed: 12 + Math.random() * 8,
      alpha: 0.2 + Math.random() * 0.5,
      width: 0.5 + Math.random() * 0.8,
    })),
    ripples: [],
    mist: Array.from({ length: 6 }, (_, i) => ({
      x: (w / 6) * i,
      y: h * 0.6 + Math.random() * h * 0.3,
      r: 60 + Math.random() * 80,
      alpha: 0.03 + Math.random() * 0.05,
      dx: (Math.random() - 0.5) * 0.15,
    })),
    t: 0,
  };
}

export function drawRain(ctx, w, h, state) {
  // Deep dark forest bg
  ctx.fillStyle = "rgba(6, 10, 18, 0.22)";
  ctx.fillRect(0, 0, w, h);

  // Wet ground glow (bottom)
  const groundGrad = ctx.createLinearGradient(0, h * 0.72, 0, h);
  groundGrad.addColorStop(0, "rgba(20,35,55,0)");
  groundGrad.addColorStop(1, "rgba(30,50,80,0.45)");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, h * 0.72, w, h * 0.28);

  // Mist layers
  state.mist.forEach((m) => {
    m.x += m.dx;
    if (m.x > w + 100) m.x = -100;
    if (m.x < -100) m.x = w + 100;
    const mg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
    mg.addColorStop(0, `rgba(140,170,210,${m.alpha})`);
    mg.addColorStop(1, "rgba(140,170,210,0)");
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.ellipse(m.x, m.y, m.r * 2.5, m.r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Rain drops
  ctx.save();
  state.drops.forEach((d) => {
    ctx.strokeStyle = `rgba(160,200,240,${d.alpha})`;
    ctx.lineWidth = d.width;
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - 1.2, d.y + d.len);
    ctx.stroke();
    d.y += d.speed;
    d.x -= 0.8;
    if (d.y > h + d.len) {
      // spawn ripple
      if (d.y > h * 0.72 && Math.random() < 0.2) {
        state.ripples.push({ x: d.x, y: h - 4, r: 0, maxR: 12 + Math.random() * 10, alpha: 0.5 });
      }
      d.y = -d.len;
      d.x = Math.random() * w;
    }
  });
  ctx.restore();

  // Ripple rings
  state.ripples = state.ripples.filter((r) => r.alpha > 0.01);
  state.ripples.forEach((r) => {
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.r, r.r * 0.28, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(160,210,255,${r.alpha})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    r.r += 0.55;
    r.alpha *= 0.93;
  });

  // Ambient foliage silhouette (top edges)
  ctx.fillStyle = "rgba(5,12,8,0.85)";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let x = 0; x <= w; x += 8) {
    const depth = Math.sin(x * 0.03 + state.t * 0.08) * 12 + Math.sin(x * 0.07) * 8;
    ctx.lineTo(x, 35 + depth);
  }
  ctx.lineTo(w, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(4,10,6,0.9)";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let x = 0; x <= w; x += 6) {
    const depth = Math.sin(x * 0.025 + state.t * 0.06 + 1) * 10 + 8;
    ctx.lineTo(x, 20 + depth);
  }
  ctx.lineTo(w, 0);
  ctx.closePath();
  ctx.fill();

  state.t += 0.016;
}
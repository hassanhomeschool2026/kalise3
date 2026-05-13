import { useEffect, useRef } from "react";

// Each scene gets its own canvas animation
function drawRain(ctx, w, h, particles) {
  ctx.clearRect(0, 0, w, h);
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#1a1a2e");
  sky.addColorStop(1, "#2d3561");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Rain drops
  ctx.strokeStyle = "rgba(160,200,255,0.45)";
  ctx.lineWidth = 1;
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
    ctx.stroke();
    p.x += p.vx;
    p.y += p.vy;
    if (p.y > h) { p.y = -10; p.x = Math.random() * w; }
  });

  // Puddle ripples
  particles.filter((_, i) => i % 12 === 0).forEach((p) => {
    if (p.y > h - 20) {
      ctx.beginPath();
      ctx.ellipse(p.x, h - 5, p.ripple || 0, (p.ripple || 0) * 0.3, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(160,200,255,0.2)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      p.ripple = ((p.ripple || 0) + 0.4) % 18;
    }
  });
}

function drawOcean(ctx, w, h, state) {
  ctx.clearRect(0, 0, w, h);
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  sky.addColorStop(0, "#0f2027");
  sky.addColorStop(1, "#203a43");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.55);

  // Stars
  state.stars.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.sin(state.t * 0.5 + s.phase) * 0.3})`;
    ctx.fill();
  });

  // Moon
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.12, 22, 0, Math.PI * 2);
  const moonGlow = ctx.createRadialGradient(w * 0.78, h * 0.12, 5, w * 0.78, h * 0.12, 28);
  moonGlow.addColorStop(0, "rgba(255,250,200,0.95)");
  moonGlow.addColorStop(1, "rgba(255,250,200,0)");
  ctx.fillStyle = moonGlow;
  ctx.fill();

  // Ocean waves
  for (let layer = 3; layer >= 0; layer--) {
    const yBase = h * 0.52 + layer * (h * 0.12);
    const alpha = 0.6 - layer * 0.1;
    const hue = 200 + layer * 5;
    ctx.beginPath();
    ctx.moveTo(0, yBase);
    for (let x = 0; x <= w; x += 4) {
      const y = yBase + Math.sin((x / w) * Math.PI * 4 + state.t * (0.8 - layer * 0.15) + layer) * (10 - layer * 1.5)
               + Math.sin((x / w) * Math.PI * 2 + state.t * 0.5) * 5;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = `hsla(${hue},60%,${25 + layer * 5}%,${alpha})`;
    ctx.fill();
  }

  // Moon reflection
  ctx.beginPath();
  for (let x = w * 0.65; x <= w * 0.9; x += 3) {
    const y = h * 0.56 + Math.sin(x * 0.1 + state.t) * 3;
    ctx.fillStyle = `rgba(255,250,200,${0.08 + Math.random() * 0.04})`;
    ctx.fillRect(x, y, 2, 6);
  }

  state.t += 0.02;
}

function drawForest(ctx, w, h, state) {
  ctx.clearRect(0, 0, w, h);
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#0d1b0d");
  sky.addColorStop(0.6, "#1a2e1a");
  sky.addColorStop(1, "#0a1a0a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Stars through canopy
  state.stars.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y * 0.4, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,255,200,${0.3 + Math.sin(state.t + s.phase) * 0.2})`;
    ctx.fill();
  });

  // Trees (back to front)
  for (let layer = 0; layer < 3; layer++) {
    const treeCount = 5 + layer * 2;
    for (let i = 0; i < treeCount; i++) {
      const x = (w / treeCount) * i + (w / treeCount / 2) + (layer * 17);
      const baseY = h * (0.55 + layer * 0.12);
      const trunkH = h * (0.25 - layer * 0.05);
      const sway = Math.sin(state.t * 0.3 + i + layer) * (3 - layer);
      const green = 30 + layer * 15;
      // Trunk
      ctx.fillStyle = `hsl(25,30%,${12 + layer * 5}%)`;
      ctx.fillRect(x - 4 + sway * 0.3, baseY, 8, trunkH * 0.3);
      // Canopy layers
      for (let c = 0; c < 3; c++) {
        ctx.beginPath();
        ctx.moveTo(x + sway, baseY - c * 35);
        ctx.lineTo(x - (40 - c * 8) + sway, baseY + (30 - c * 10));
        ctx.lineTo(x + (40 - c * 8) + sway, baseY + (30 - c * 10));
        ctx.closePath();
        ctx.fillStyle = `hsl(120,${40 - layer * 5}%,${green - c * 5}%)`;
        ctx.fill();
      }
    }
  }

  // Fireflies
  state.fireflies.forEach((f) => {
    f.x += Math.sin(state.t * f.speed + f.phase) * 0.5;
    f.y += Math.cos(state.t * f.speed * 0.7 + f.phase) * 0.3;
    const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 6);
    const alpha = 0.4 + Math.sin(state.t * 2 + f.phase) * 0.4;
    glow.addColorStop(0, `rgba(200,255,100,${alpha})`);
    glow.addColorStop(1, "rgba(200,255,100,0)");
    ctx.beginPath();
    ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
  });

  state.t += 0.016;
}

function drawFire(ctx, w, h, particles) {
  ctx.fillStyle = "rgba(10,5,0,0.3)";
  ctx.fillRect(0, 0, w, h);

  // Dark room bg on first frame
  if (particles._init) {
    ctx.fillStyle = "#0a0500";
    ctx.fillRect(0, 0, w, h);
    particles._init = false;
  }

  // Logs
  const logY = h * 0.75;
  ctx.fillStyle = "#3d1a00";
  ctx.beginPath();
  ctx.ellipse(w * 0.5, logY, w * 0.22, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w * 0.5, logY + 6, w * 0.18, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Ember glow on logs
  ctx.fillStyle = "rgba(255,80,0,0.25)";
  ctx.fillRect(w * 0.3, logY - 4, w * 0.4, 8);

  // Fire particles
  particles.forEach((p) => {
    const life = p.life / p.maxLife;
    const r = Math.floor(255);
    const g = Math.floor(life > 0.5 ? 200 * (life - 0.5) * 2 : 100 * life * 2);
    const b = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * life, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${life * 0.85})`;
    ctx.fill();
    p.x += p.vx + Math.sin(p.life * 0.3) * 0.5;
    p.y += p.vy;
    p.size *= 0.995;
    p.life--;
    if (p.life <= 0) {
      p.x = w * 0.5 + (Math.random() - 0.5) * w * 0.18;
      p.y = logY - 5;
      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = -(1.5 + Math.random() * 2.5);
      p.size = 6 + Math.random() * 10;
      p.life = p.maxLife = 40 + Math.random() * 40;
    }
  });

  // Warm glow overlay
  const glow = ctx.createRadialGradient(w * 0.5, logY, 10, w * 0.5, logY, w * 0.7);
  glow.addColorStop(0, "rgba(255,80,0,0.12)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function drawNight(ctx, w, h, state) {
  ctx.clearRect(0, 0, w, h);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#020408");
  sky.addColorStop(0.7, "#0a0e1a");
  sky.addColorStop(1, "#0d1a0d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Milky way
  for (let i = 0; i < 8; i++) {
    const x = w * 0.2 + i * (w * 0.08);
    const y = h * 0.1 + Math.sin(i * 0.8) * h * 0.15;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 30);
    glow.addColorStop(0, "rgba(180,180,220,0.06)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }

  // Stars
  state.stars.forEach((s) => {
    const twinkle = 0.5 + Math.sin(state.t * s.speed + s.phase) * 0.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * twinkle, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.9})`;
    ctx.fill();
  });

  // Moon
  ctx.beginPath();
  ctx.arc(w * 0.72, h * 0.18, 30, 0, Math.PI * 2);
  const moonG = ctx.createRadialGradient(w * 0.72, h * 0.18, 8, w * 0.72, h * 0.18, 35);
  moonG.addColorStop(0, "rgba(240,235,200,0.95)");
  moonG.addColorStop(0.7, "rgba(240,235,200,0.7)");
  moonG.addColorStop(1, "rgba(240,235,200,0)");
  ctx.fillStyle = moonG;
  ctx.fill();

  // Silhouette hills
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 4) {
    const y = h * 0.7 + Math.sin(x * 0.008) * h * 0.1 + Math.sin(x * 0.02) * h * 0.04;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fillStyle = "#060c06";
  ctx.fill();

  // Cricket lights (random blinks)
  state.fireflies.forEach((f) => {
    const on = Math.sin(state.t * f.speed + f.phase) > 0.7;
    if (on) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(150,255,100,0.6)";
      ctx.fill();
    }
  });

  state.t += 0.01;
}

function drawStream(ctx, w, h, state) {
  ctx.clearRect(0, 0, w, h);
  // Rocky mountain bg
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  sky.addColorStop(0, "#1a2535");
  sky.addColorStop(1, "#2d4a3e");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.5);

  // Mountains
  [[0.1, 0.45, 0.35], [0.4, 0.38, 0.3], [0.65, 0.42, 0.28]].forEach(([cx, cy, hw]) => {
    ctx.beginPath();
    ctx.moveTo(w * (cx - hw), h * 0.5);
    ctx.lineTo(w * cx, h * cy);
    ctx.lineTo(w * (cx + hw), h * 0.5);
    ctx.closePath();
    ctx.fillStyle = "hsl(200,20%,20%)";
    ctx.fill();
    // Snow cap
    ctx.beginPath();
    ctx.moveTo(w * cx, h * cy);
    ctx.lineTo(w * (cx - 0.04), h * (cy + 0.06));
    ctx.lineTo(w * (cx + 0.04), h * (cy + 0.06));
    ctx.closePath();
    ctx.fillStyle = "rgba(220,235,245,0.8)";
    ctx.fill();
  });

  // Stream bed
  const streamY = h * 0.5;
  ctx.fillStyle = "#1a3a2a";
  ctx.fillRect(0, streamY, w, h - streamY);

  // Water flow
  for (let layer = 0; layer < 4; layer++) {
    ctx.beginPath();
    ctx.moveTo(0, streamY + layer * 15);
    for (let x = 0; x <= w; x += 5) {
      const y = streamY + layer * 15 + Math.sin(x * 0.03 + state.t * (1.5 - layer * 0.3)) * 4;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(100,200,200,${0.3 - layer * 0.05})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Foam/bubbles
  state.bubbles.forEach((b) => {
    b.x += b.vx;
    b.y += 0.3;
    if (b.x > w || b.y > h) { b.x = Math.random() * w * 0.3; b.y = streamY; }
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(200,240,255,0.4)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });

  // Rocks
  [[0.2, 0.62], [0.5, 0.7], [0.75, 0.65], [0.35, 0.8], [0.85, 0.75]].forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(w * rx, h * ry, 18, 11, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(200,10%,35%)";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * rx - 3, h * ry - 3, 8, 5, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(200,10%,45%)";
    ctx.fill();
  });

  state.t += 0.018;
}

function drawWindChimes(ctx, w, h, state) {
  ctx.clearRect(0, 0, w, h);
  // Soft dawn gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#1a0a2e");
  sky.addColorStop(0.5, "#3d1c5e");
  sky.addColorStop(1, "#6b2f6b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Soft stars
  state.stars.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,220,255,${0.3 + Math.sin(state.t + s.phase) * 0.2})`;
    ctx.fill();
  });

  // Wind chimes
  const chimeCount = 5;
  const chimeX = [0.2, 0.33, 0.46, 0.59, 0.72].map((v) => w * v);
  const chimeLengths = [80, 110, 95, 120, 85];

  // Top bar
  ctx.fillStyle = "rgba(200,180,220,0.6)";
  ctx.fillRect(chimeX[0] - 15, h * 0.12, chimeX[4] - chimeX[0] + 30, 4);

  chimeX.forEach((cx, i) => {
    const swing = Math.sin(state.t * (0.4 + i * 0.08) + state.windPhase + i) * (8 + i * 2);
    const topY = h * 0.12 + 4;
    const botY = topY + chimeLengths[i];

    // String
    ctx.beginPath();
    ctx.moveTo(cx + swing * 0.3, topY);
    ctx.quadraticCurveTo(cx + swing * 0.7, topY + chimeLengths[i] * 0.5, cx + swing, botY);
    ctx.strokeStyle = "rgba(200,180,220,0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Chime tube
    ctx.save();
    ctx.translate(cx + swing, botY);
    ctx.fillStyle = `rgba(220,200,240,0.75)`;
    ctx.fillRect(-3, 0, 6, 22);
    // Shine
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(-1, 2, 2, 18);
    ctx.restore();
  });

  // Wind particles
  state.windParticles.forEach((p) => {
    p.x += p.vx;
    p.y += Math.sin(state.t + p.phase) * 0.3;
    p.alpha -= 0.003;
    if (p.alpha <= 0 || p.x > w) {
      p.x = -10;
      p.y = Math.random() * h;
      p.alpha = 0.3 + Math.random() * 0.3;
      p.vx = 0.5 + Math.random() * 1.5;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,180,255,${p.alpha})`;
    ctx.fill();
  });

  state.windPhase += 0.005;
  state.t += 0.015;
}

function drawThunder(ctx, w, h, state) {
  // Rolling dark clouds + lightning
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(200,210,255,${state.flash * 0.3})`;
    ctx.fillRect(0, 0, w, h);
    state.flash -= 0.05;
  } else {
    ctx.clearRect(0, 0, w, h);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#080810");
    sky.addColorStop(1, "#101020");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
  }

  // Cloud layers
  for (let layer = 0; layer < 3; layer++) {
    const yOff = layer * (h * 0.15);
    const xOff = (state.t * (0.3 + layer * 0.1)) % (w * 0.3);
    for (let i = -1; i < 4; i++) {
      const cx = i * (w * 0.35) + xOff;
      const cy = h * 0.15 + yOff + Math.sin(i + layer) * 20;
      for (let b = 0; b < 6; b++) {
        const bx = cx + b * 25 - 50;
        const by = cy + Math.sin(b * 0.8) * 15;
        const r = 35 + Math.sin(b) * 10;
        const cloudG = ctx.createRadialGradient(bx, by, 5, bx, by, r);
        cloudG.addColorStop(0, `rgba(30,30,50,0.9)`);
        cloudG.addColorStop(1, `rgba(20,20,40,0)`);
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fillStyle = cloudG;
        ctx.fill();
      }
    }
  }

  // Rain
  state.rain.forEach((r) => {
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x - 1, r.y - 12);
    ctx.strokeStyle = "rgba(130,160,200,0.35)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    r.x += 0.5;
    r.y += 8;
    if (r.y > h) { r.y = -10; r.x = Math.random() * w; }
  });

  // Lightning trigger
  state.nextFlash -= 1;
  if (state.nextFlash <= 0) {
    state.flash = 1;
    state.nextFlash = 200 + Math.random() * 400;
    // Draw bolt
    let bx = w * (0.2 + Math.random() * 0.6);
    let by = h * 0.05;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.strokeStyle = "rgba(200,220,255,0.9)";
    ctx.lineWidth = 2;
    for (let seg = 0; seg < 8; seg++) {
      bx += (Math.random() - 0.5) * 30;
      by += h * 0.07;
      ctx.lineTo(bx, by);
    }
    ctx.stroke();
  }

  state.t += 0.01;
}

const SCENE_INITS = {
  rain: (w, h) => Array.from({ length: 120 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: -0.5,
    vy: 8 + Math.random() * 5,
    ripple: Math.random() * 18,
  })),
  ocean: (w, h) => ({
    t: 0,
    stars: Array.from({ length: 60 }, () => ({ x: Math.random() * w, y: Math.random() * h * 0.45, r: Math.random() * 1.5, phase: Math.random() * Math.PI * 2 })),
  }),
  forest: (w, h) => ({
    t: 0,
    stars: Array.from({ length: 40 }, () => ({ x: Math.random() * w, y: Math.random() * h * 0.4, r: Math.random() * 1.2, phase: Math.random() * Math.PI * 2 })),
    fireflies: Array.from({ length: 18 }, () => ({ x: Math.random() * w, y: h * 0.3 + Math.random() * h * 0.35, speed: 0.5 + Math.random(), phase: Math.random() * Math.PI * 2 })),
  }),
  fire: () => {
    const p = Array.from({ length: 80 }, (_, i) => ({
      x: 0, y: 0, vx: 0, vy: 0, size: 0, life: i * 2, maxLife: 1,
    }));
    p._init = true;
    return p;
  },
  night: (w, h) => ({
    t: 0,
    stars: Array.from({ length: 120 }, () => ({ x: Math.random() * w, y: Math.random() * h * 0.65, r: 0.5 + Math.random() * 1.5, speed: 0.5 + Math.random(), phase: Math.random() * Math.PI * 2 })),
    fireflies: Array.from({ length: 25 }, () => ({ x: Math.random() * w, y: h * 0.55 + Math.random() * h * 0.35, speed: 1 + Math.random() * 2, phase: Math.random() * Math.PI * 2 })),
  }),
  stream: (w, h) => ({
    t: 0,
    bubbles: Array.from({ length: 30 }, () => ({ x: Math.random() * w, y: h * 0.5 + Math.random() * h * 0.4, vx: 0.3 + Math.random() * 0.8, r: 1 + Math.random() * 3 })),
  }),
  wind: (w, h) => ({
    t: 0,
    windPhase: 0,
    stars: Array.from({ length: 50 }, () => ({ x: Math.random() * w, y: Math.random() * h * 0.6, r: 0.5 + Math.random(), phase: Math.random() * Math.PI * 2 })),
    windParticles: Array.from({ length: 40 }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: 0.5 + Math.random() * 1.5, alpha: Math.random() * 0.3, phase: Math.random() * Math.PI * 2 })),
  }),
  thunder: (w, h) => ({
    t: 0,
    flash: 0,
    nextFlash: 150,
    rain: Array.from({ length: 100 }, () => ({ x: Math.random() * w, y: Math.random() * h })),
  }),
};

const DRAW_FNS = {
  rain: drawRain,
  ocean: drawOcean,
  forest: drawForest,
  fire: drawFire,
  night: drawNight,
  stream: drawStream,
  wind: drawWindChimes,
  thunder: drawThunder,
};

export default function AmbienceVisual({ sceneId, playing }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    stateRef.current = SCENE_INITS[sceneId]?.(w, h);
    const draw = DRAW_FNS[sceneId];
    if (!draw) return;

    const loop = () => {
      draw(ctx, w, h, stateRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [sceneId]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="w-full h-full object-cover rounded-3xl"
      style={{ display: "block" }}
    />
  );
}
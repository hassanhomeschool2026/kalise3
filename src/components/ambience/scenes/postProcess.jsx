// Shared post-processing effects for all ambience scenes

/**
 * Film grain — adds analog noise over the canvas.
 * intensity: 0.0 – 1.0
 */
export function applyFilmGrain(ctx, w, h, intensity = 0.045) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const len = data.length;
  const grain = intensity * 255;
  for (let i = 0; i < len; i += 4) {
    const n = (Math.random() - 0.5) * grain;
    data[i]     = Math.min(255, Math.max(0, data[i]     + n));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Vignette — darkens the edges for a cinematic, lens-like look.
 * strength: 0.0 – 1.0
 */
export function applyVignette(ctx, w, h, strength = 0.55) {
  const cx = w / 2, cy = h / 2;
  const radius = Math.sqrt(cx * cx + cy * cy);
  const vg = ctx.createRadialGradient(cx, cy, radius * 0.38, cx, cy, radius);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Chromatic aberration fringe — subtle colour split at edges.
 * amount: pixel offset (1–3 recommended)
 */
export function applyChroma(ctx, w, h, amount = 1.2) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.018;
  ctx.drawImage(ctx.canvas, -amount, 0);
  ctx.globalAlpha = 0.018;
  ctx.drawImage(ctx.canvas, amount, 0);
  ctx.restore();
}
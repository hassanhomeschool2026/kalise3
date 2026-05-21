import { useEffect, useRef } from "react";

export default function PondRipple() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Offscreen canvas for the base water scene (used for displacement sampling)
    const bgCanvas = document.createElement("canvas");
    const bgCtx = bgCanvas.getContext("2d");

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      bgCanvas.width = canvas.width;
      bgCanvas.height = canvas.height;
    }
    resize();
    window.addEventListener("resize", resize);

    // --- Scene Elements ---
    const ripples = [];
    let t = 0;
    let animId;

    // Lily pads
    const lilies = Array.from({ length: 6 }, () => ({
      x: 0.1 + Math.random() * 0.8,
      y: 0.2 + Math.random() * 0.65,
      r: 14 + Math.random() * 18,
      angle: Math.random() * Math.PI * 2,
      bobPhase: Math.random() * Math.PI * 2,
      hasFlower: Math.random() > 0.5,
    }));

    // Floating dust / pollen particles
    const dust = Array.from({ length: 25 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.8 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.0002 + Math.random() * 0.0004,
    }));

    // Reflected "sky" streaks (light shimmer on water)
    const shimmers = Array.from({ length: 14 }, () => ({
      x: Math.random(),
      y: 0.05 + Math.random() * 0.9,
      w: 0.04 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.6,
    }));

    // --- Draw the base water scene onto bgCanvas ---
    function drawBase(w, h) {
      // Deep water gradient
      const bg = bgCtx.createLinearGradient(0, 0, w * 0.3, h);
      bg.addColorStop(0, "#020e1a");
      bg.addColorStop(0.4, "#051e35");
      bg.addColorStop(0.7, "#071f2e");
      bg.addColorStop(1, "#030d16");
      bgCtx.fillStyle = bg;
      bgCtx.fillRect(0, 0, w, h);

      // Subtle caustic light patches (light dancing on deep water)
      for (let i = 0; i < 8; i++) {
        const cx = w * (0.1 + (i * 0.113) % 0.85);
        const cy = h * (0.15 + (i * 0.173) % 0.72);
        const cr = 30 + Math.sin(t * 0.4 + i) * 15;
        const cg = bgCtx.createRadialGradient(cx, cy, 0, cx, cy, cr);
        cg.addColorStop(0, `rgba(40,110,180,${0.06 + Math.sin(t * 0.6 + i) * 0.03})`);
        cg.addColorStop(1, "rgba(0,0,0,0)");
        bgCtx.fillStyle = cg;
        bgCtx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
      }

      // Light shimmer streaks (surface light reflections)
      shimmers.forEach((s, i) => {
        const sx = s.x * w + Math.sin(t * s.speed + s.phase) * w * 0.04;
        const sy = s.y * h;
        const sw = s.w * w;
        const alpha = 0.025 + Math.sin(t * 1.1 + s.phase) * 0.02;
        const sg = bgCtx.createLinearGradient(sx - sw / 2, sy, sx + sw / 2, sy);
        sg.addColorStop(0, "rgba(150,210,255,0)");
        sg.addColorStop(0.5, `rgba(180,225,255,${alpha})`);
        sg.addColorStop(1, "rgba(150,210,255,0)");
        bgCtx.fillStyle = sg;
        bgCtx.fillRect(sx - sw / 2, sy - 1, sw, 2.5);
      });

      // Lily pads
      lilies.forEach(l => {
        const x = l.x * w;
        const y = l.y * h + Math.sin(t * 0.4 + l.bobPhase) * 1.5;
        const wobble = Math.sin(t * 0.25 + l.bobPhase) * 0.04;
        bgCtx.save();
        bgCtx.translate(x, y);
        bgCtx.rotate(l.angle + wobble);

        // Shadow beneath pad
        bgCtx.beginPath();
        bgCtx.ellipse(2, 3, l.r * 0.95, l.r * 0.4, 0, 0, Math.PI * 2);
        bgCtx.fillStyle = "rgba(0,0,0,0.25)";
        bgCtx.fill();

        // Pad body
        bgCtx.beginPath();
        bgCtx.arc(0, 0, l.r, 0.15, Math.PI * 2 - 0.15);
        bgCtx.closePath();
        const padGrad = bgCtx.createRadialGradient(-l.r * 0.3, -l.r * 0.3, 1, 0, 0, l.r);
        padGrad.addColorStop(0, "#2d7a3a");
        padGrad.addColorStop(0.6, "#1e5c2a");
        padGrad.addColorStop(1, "#143d1b");
        bgCtx.fillStyle = padGrad;
        bgCtx.fill();
        bgCtx.strokeStyle = "rgba(80,160,80,0.4)";
        bgCtx.lineWidth = 1;
        bgCtx.stroke();

        // Vein lines
        for (let v = 0; v < 5; v++) {
          const vAngle = (v / 5) * Math.PI * 1.8 + 0.1;
          bgCtx.beginPath();
          bgCtx.moveTo(0, 0);
          bgCtx.lineTo(Math.cos(vAngle) * l.r * 0.9, Math.sin(vAngle) * l.r * 0.9);
          bgCtx.strokeStyle = "rgba(60,130,60,0.35)";
          bgCtx.lineWidth = 0.7;
          bgCtx.stroke();
        }

        // Notch
        bgCtx.beginPath();
        bgCtx.moveTo(0, 0);
        bgCtx.lineTo(l.r * Math.cos(0.15), l.r * Math.sin(0.15));
        bgCtx.strokeStyle = "rgba(10,40,15,0.6)";
        bgCtx.lineWidth = 1.2;
        bgCtx.stroke();

        // Flower
        if (l.hasFlower) {
          for (let p = 0; p < 6; p++) {
            const pa = (p / 6) * Math.PI * 2;
            bgCtx.beginPath();
            bgCtx.ellipse(
              Math.cos(pa) * 4, Math.sin(pa) * 4,
              3.5, 2.5, pa, 0, Math.PI * 2
            );
            bgCtx.fillStyle = `rgba(255,${180 + p * 10},${200 + p * 5},0.85)`;
            bgCtx.fill();
          }
          bgCtx.beginPath();
          bgCtx.arc(0, 0, 3, 0, Math.PI * 2);
          bgCtx.fillStyle = "rgba(255,230,80,0.95)";
          bgCtx.fill();
        }

        bgCtx.restore();
      });

      // Floating dust/pollen
      dust.forEach(d => {
        d.x += d.speed;
        if (d.x > 1) d.x = 0;
        const dx = d.x * w;
        const dy = d.y * h + Math.sin(t * 0.5 + d.phase) * 6;
        const alpha = 0.2 + Math.sin(t * 0.8 + d.phase) * 0.15;
        bgCtx.beginPath();
        bgCtx.arc(dx, dy, d.r, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(200,230,200,${alpha})`;
        bgCtx.fill();
      });
    }

    // --- Ripple displacement rendering ---
    function addRipple(x, y) {
      ripples.push({
        x, y,
        born: performance.now(),
        rings: 5,
      });
    }

    function drawRipples(w, h) {
      const now = performance.now();

      ripples.forEach((rp, ri) => {
        const age = now - rp.born;
        const duration = 3200;

        for (let ring = 0; ring < rp.rings; ring++) {
          const ringDelay = ring * 180;
          const ringAge = age - ringDelay;
          if (ringAge < 0) continue;

          const progress = Math.min(ringAge / duration, 1);
          if (progress >= 1 && ring === rp.rings - 1) {
            ripples.splice(ri, 1);
            continue;
          }

          // Eased radius expansion
          const eased = 1 - Math.pow(1 - progress, 2.5);
          const maxRadius = 80 + ring * 22;
          const r = maxRadius * eased;
          const rY = r * 0.42; // elliptical for perspective

          // Fade: sharp appear, slow fade out
          const alpha = (1 - progress) * (0.6 - ring * 0.08);
          if (alpha <= 0) continue;

          // Line width tapers as it expands
          const lw = 2.5 * (1 - progress * 0.7);

          // --- Main ripple ring (bright crest) ---
          ctx.beginPath();
          ctx.ellipse(rp.x, rp.y, r, rY, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(180,230,255,${alpha * 0.9})`;
          ctx.lineWidth = lw;
          ctx.stroke();

          // --- Inner shadow (trough behind crest) ---
          const innerR = r * 0.88;
          const innerRY = innerR * 0.42;
          ctx.beginPath();
          ctx.ellipse(rp.x, rp.y, innerR, innerRY, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(5,25,50,${alpha * 0.35})`;
          ctx.lineWidth = lw * 0.8;
          ctx.stroke();

          // --- Outer soft glow (light scatter) ---
          const outerR = r * 1.06;
          const outerRY = outerR * 0.42;
          ctx.beginPath();
          ctx.ellipse(rp.x, rp.y, outerR, outerRY, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(140,200,255,${alpha * 0.2})`;
          ctx.lineWidth = lw * 1.8;
          ctx.stroke();

          // --- Surface displacement shimmer (light refraction arc) ---
          if (ring === 0 && progress < 0.6) {
            const shimmerAlpha = (0.6 - progress) * 0.5;
            const shimmerGrad = ctx.createLinearGradient(
              rp.x - r, rp.y,
              rp.x + r, rp.y
            );
            shimmerGrad.addColorStop(0, "rgba(255,255,255,0)");
            shimmerGrad.addColorStop(0.35, `rgba(220,240,255,${shimmerAlpha})`);
            shimmerGrad.addColorStop(0.5, `rgba(255,255,255,${shimmerAlpha * 1.4})`);
            shimmerGrad.addColorStop(0.65, `rgba(220,240,255,${shimmerAlpha})`);
            shimmerGrad.addColorStop(1, "rgba(255,255,255,0)");
            ctx.beginPath();
            ctx.ellipse(rp.x, rp.y, r, rY, 0, 0, Math.PI * 2);
            ctx.strokeStyle = shimmerGrad;
            ctx.lineWidth = lw * 2.5;
            ctx.stroke();
          }
        }

        // --- Impact splash: tiny droplet arcs right at origin ---
        const splashDuration = 400;
        if (age < splashDuration) {
          const sp = age / splashDuration;
          for (let d = 0; d < 7; d++) {
            const angle = (d / 7) * Math.PI * 2;
            const dist = sp * 18;
            const sx = rp.x + Math.cos(angle) * dist;
            const sy = rp.y + Math.sin(angle) * dist * 0.4 - sp * 10;
            const sa = (1 - sp) * 0.7;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5 * (1 - sp), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,235,255,${sa})`;
            ctx.fill();
          }
          // Central impact glow
          const cg = ctx.createRadialGradient(rp.x, rp.y, 0, rp.x, rp.y, 12 * (1 - sp));
          cg.addColorStop(0, `rgba(220,245,255,${(1 - sp) * 0.6})`);
          cg.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = cg;
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, 12 * (1 - sp), 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    function draw() {
      animId = requestAnimationFrame(draw);
      const w = canvas.width, h = canvas.height;
      t += 0.012;

      // 1. Draw base scene to offscreen canvas
      drawBase(w, h);

      // 2. Copy base scene to main canvas
      ctx.drawImage(bgCanvas, 0, 0);

      // 3. Draw ripples on top with compositing for refraction effect
      ctx.globalCompositeOperation = "source-over";
      drawRipples(w, h);
    }
    draw();

    function onPointer(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const touches = e.touches || [e];
      for (const touch of touches) {
        addRipple(
          (touch.clientX - rect.left) * scaleX,
          (touch.clientY - rect.top) * scaleY
        );
      }
    }

    canvas.addEventListener("click", onPointer);
    canvas.addEventListener("touchstart", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", onPointer);
      canvas.removeEventListener("touchstart", onPointer);
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/30 tracking-wide">
        Touch the water
      </p>
    </div>
  );
}
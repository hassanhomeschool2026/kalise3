import { useEffect, useRef } from "react";

export default function PondRipple() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const ripples = [];
    const lilies = [];
    let animId;
    let t = 0;

    for (let i = 0; i < 5; i++) {
      lilies.push({
        x: 0.15 + Math.random() * 0.7,
        y: 0.3 + Math.random() * 0.5,
        r: 12 + Math.random() * 14,
        angle: Math.random() * Math.PI * 2,
      });
    }

    function addRipple(x, y) {
      for (let ring = 0; ring < 4; ring++) {
        ripples.push({ x, y, maxR: 60 + ring * 30, alpha: 0.7 - ring * 0.12, delay: ring * 120, born: performance.now() });
      }
    }

    function draw() {
      animId = requestAnimationFrame(draw);
      const w = canvas.width, h = canvas.height;
      t += 0.012;

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#051525");
      bg.addColorStop(0.5, "#0a2540");
      bg.addColorStop(1, "#061a30");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 6; i++) {
        const y = h * (0.2 + i * 0.13) + Math.sin(t * 0.5 + i) * 4;
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(w, y);
        ctx.strokeStyle = `rgba(100,180,255,${0.03 + Math.sin(t + i) * 0.015})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      lilies.forEach(l => {
        const x = l.x * w, y = l.y * h;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(l.angle + Math.sin(t * 0.3) * 0.05);
        ctx.beginPath();
        ctx.arc(0, 0, l.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(30,90,40,0.7)";
        ctx.fill();
        ctx.strokeStyle = "rgba(60,140,60,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(l.r, 0);
        ctx.strokeStyle = "rgba(20,70,30,0.8)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

      const now = performance.now();
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        const elapsed = now - rp.born - rp.delay;
        if (elapsed < 0) continue;
        const progress = elapsed / 1800;
        if (progress >= 1) { ripples.splice(i, 1); continue; }
        const r = rp.maxR * progress;
        const alpha = rp.alpha * (1 - progress);
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, r, r * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(140,200,255,${alpha})`;
        ctx.lineWidth = 1.5 * (1 - progress * 0.5);
        ctx.stroke();
      }

      for (let i = 0; i < 20; i++) {
        const sx = ((i * 137.5) % 1) * w;
        const sy = ((i * 97.3) % 0.8 + 0.1) * h;
        const twinkle = 0.3 + Math.sin(t * 1.5 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,235,255,${twinkle * 0.5})`;
        ctx.fill();
      }
    }
    draw();

    function onClick(e) {
      const rect = canvas.getBoundingClientRect();
      addRipple(e.clientX - rect.left, e.clientY - rect.top);
    }
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" />
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/40">Tap the water to create ripples</p>
    </div>
  );
}
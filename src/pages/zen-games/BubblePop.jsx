import { useEffect, useRef, useState } from "react";

export default function BubblePop() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ bubbles: [], particles: [], score: 0, animId: null });
  const [score, setScore] = useState(0);

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

    const s = stateRef.current;
    s.bubbles = [];
    s.particles = [];

    function spawnBubble() {
      const r = 22 + Math.random() * 28;
      const hue = 220 + Math.random() * 120;
      s.bubbles.push({
        x: r + Math.random() * (canvas.width - r * 2),
        y: canvas.height + r,
        r, hue,
        vy: -(0.6 + Math.random() * 0.8),
        vx: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    function burst(b) {
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        s.particles.push({
          x: b.x, y: b.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 3 + Math.random() * 4,
          hue: b.hue,
          life: 1,
        });
      }
    }

    const interval = setInterval(spawnBubble, 1200);
    spawnBubble(); spawnBubble(); spawnBubble();

    let t = 0;
    function draw() {
      s.animId = requestAnimationFrame(draw);
      const w = canvas.width, h = canvas.height;
      t += 0.016;

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#0d0520");
      bg.addColorStop(1, "#1a0a35");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      s.bubbles = s.bubbles.filter(b => b.y + b.r > -10);
      s.bubbles.forEach(b => {
        b.y += b.vy;
        b.x += b.vx + Math.sin(t * 0.8 + b.phase) * 0.3;

        const grd = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1, b.x, b.y, b.r);
        grd.addColorStop(0, `hsla(${b.hue}, 90%, 85%, 0.55)`);
        grd.addColorStop(0.7, `hsla(${b.hue}, 80%, 60%, 0.25)`);
        grd.addColorStop(1, `hsla(${b.hue}, 70%, 50%, 0.5)`);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${b.hue}, 80%, 80%, 0.6)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fill();
      });

      s.particles = s.particles.filter(p => p.life > 0);
      s.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.92; p.vy *= 0.92;
        p.life -= 0.04;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.life})`;
        ctx.fill();
      });
    }
    draw();

    function onClick(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      for (let i = s.bubbles.length - 1; i >= 0; i--) {
        const b = s.bubbles[i];
        const dx = mx - b.x, dy = my - b.y;
        if (dx * dx + dy * dy < b.r * b.r) {
          burst(b);
          s.bubbles.splice(i, 1);
          s.score++;
          setScore(s.score);
          break;
        }
      }
    }
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(s.animId);
      clearInterval(interval);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white/80">
        {score} popped
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/40">Tap the bubbles</p>
    </div>
  );
}
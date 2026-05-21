import { useEffect, useRef, useState } from "react";

export default function SandGarden() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ angle: 0, speed: 0.003, grooves: 18 });
  const [speed, setSpeed] = useState("slow");

  const speeds = { slow: 0.003, medium: 0.007, fast: 0.014 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      animId = requestAnimationFrame(draw);
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const radius = Math.min(w, h) * 0.44;

      // Advance rotation
      stateRef.current.angle += stateRef.current.speed;
      const angle = stateRef.current.angle;
      const grooves = stateRef.current.grooves;

      // --- Background: white pebble/stone surround ---
      ctx.fillStyle = "#c8c4bc";
      ctx.fillRect(0, 0, w, h);

      // Pebble texture dots
      for (let i = 0; i < 80; i++) {
        const px = ((i * 137.5) % 1) * w;
        const py = ((i * 97.3) % 1) * h;
        // Skip if inside sand circle
        const dx = px - cx, dy = py - cy;
        if (dx * dx + dy * dy < (radius + 28) * (radius + 28)) continue;
        const pr = 6 + (i % 4) * 4;
        const g = ctx.createRadialGradient(px - pr * 0.2, py - pr * 0.2, 1, px, py, pr);
        g.addColorStop(0, "#dedad4");
        g.addColorStop(0.6, "#b8b4ac");
        g.addColorStop(1, "#8a877f");
        ctx.beginPath();
        ctx.ellipse(px, py, pr, pr * 0.8, i * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // --- Outer ring (dark border) ---
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 18, 0, Math.PI * 2);
      const ringGrad = ctx.createRadialGradient(cx, cy, radius + 10, cx, cy, radius + 20);
      ringGrad.addColorStop(0, "#2a2620");
      ringGrad.addColorStop(1, "#1a1510");
      ctx.fillStyle = ringGrad;
      ctx.fill();

      // Clip everything inside the sand circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // --- Sand base: smooth half (0 to PI, the "smooth" side based on rotation) ---
      // Full sand fill
      const sandGrad = ctx.createRadialGradient(cx - radius * 0.1, cy - radius * 0.1, 0, cx, cy, radius);
      sandGrad.addColorStop(0, "#f0ebe0");
      sandGrad.addColorStop(0.6, "#e8e2d4");
      sandGrad.addColorStop(1, "#d8d2c4");
      ctx.fillStyle = sandGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // --- Raked half: concentric arcs on one half ---
      // The dividing line is at `angle`. Raked side = angle to angle+PI
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Clip to the raked semicircle
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, 0, Math.PI);
      ctx.closePath();
      ctx.clip();

      // Draw concentric groove arcs
      for (let i = 1; i <= grooves; i++) {
        const r = (i / grooves) * radius * 0.97;
        const depth = 0.5 + (i % 3) * 0.15; // subtle variation in groove depth

        // Shadow (groove trough)
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI);
        ctx.strokeStyle = `rgba(140,130,110,${0.35 * depth})`;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Highlight (groove crest)
        ctx.beginPath();
        ctx.arc(0, 0, r - 1.5, 0, Math.PI);
        ctx.strokeStyle = `rgba(255,252,242,${0.55 * depth})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Fine shadow line inside
        ctx.beginPath();
        ctx.arc(0, 0, r + 1.2, 0, Math.PI);
        ctx.strokeStyle = `rgba(100,90,70,${0.18 * depth})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      ctx.restore(); // raked clip

      // --- Smooth half: subtle flat sand texture ---
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Very faint smooth grain lines
      for (let i = 1; i <= grooves; i++) {
        const r = (i / grooves) * radius * 0.97;
        ctx.beginPath();
        ctx.arc(0, 0, r, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `rgba(200,195,180,0.12)`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      ctx.restore(); // smooth clip

      // Dividing blade line
      ctx.beginPath();
      ctx.moveTo(-radius, 0);
      ctx.lineTo(radius, 0);
      const bladeGrad = ctx.createLinearGradient(-radius, 0, radius, 0);
      bladeGrad.addColorStop(0, "rgba(180,170,150,0)");
      bladeGrad.addColorStop(0.1, "rgba(200,190,170,0.7)");
      bladeGrad.addColorStop(0.5, "rgba(220,215,200,0.9)");
      bladeGrad.addColorStop(0.9, "rgba(200,190,170,0.7)");
      bladeGrad.addColorStop(1, "rgba(180,170,150,0)");
      ctx.strokeStyle = bladeGrad;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      // Blade edge highlight
      ctx.beginPath();
      ctx.moveTo(-radius, -1);
      ctx.lineTo(radius, -1);
      ctx.strokeStyle = "rgba(255,252,240,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore(); // rotation

      // --- Center pivot knob ---
      const pivotGrad = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, 12);
      pivotGrad.addColorStop(0, "#555045");
      pivotGrad.addColorStop(0.5, "#2a2520");
      pivotGrad.addColorStop(1, "#1a1510");
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fillStyle = pivotGrad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 3, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(100,95,85,0.5)";
      ctx.fill();

      // --- Sand rim shadow inside circle ---
      const rimGrad = ctx.createRadialGradient(cx, cy, radius * 0.82, cx, cy, radius);
      rimGrad.addColorStop(0, "rgba(0,0,0,0)");
      rimGrad.addColorStop(1, "rgba(0,0,0,0.18)");
      ctx.fillStyle = rimGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      ctx.restore(); // clip
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Sync speed to ref
  useEffect(() => {
    stateRef.current.speed = speeds[speed];
  }, [speed]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#c8c4bc]">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-4 flex gap-2">
        {Object.keys(speeds).map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all capitalize ${
              speed === s ? "bg-white/30 text-white" : "bg-black/20 text-white/50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
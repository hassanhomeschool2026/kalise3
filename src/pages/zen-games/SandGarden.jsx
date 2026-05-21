import { useEffect, useRef, useState } from "react";

export default function SandGarden() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    angle: 0,
    autoSpeed: 0.003,
    manualVelocity: 0,
    isDragging: false,
    lastPointerAngle: null,
    lastPointerTime: null,
    grooves: 18,
    sandPiles: [], // { angle, size } accumulated sand at rim
  });
  const [speed, setSpeed] = useState("slow");
  const [isAuto, setIsAuto] = useState(true);

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

    const s = stateRef.current;

    // Sand ridge along the blade: array of {t: 0..1, size} where t=0 is left tip, t=1 is right tip
    // t=0.5 is center pivot. Piles live in blade-local coords, rendered rotated with the blade.
    s.sandRidge = Array.from({ length: 32 }, (_, i) => ({
      t: i / 31, // 0..1 along blade
      size: 1 + Math.random() * 2.5,
    }));
    s.sandPiles = []; // unused now

    // --- Pointer helpers ---
    function getPointerAngle(e, cx, cy) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = (clientX - rect.left) * (canvas.width / rect.width) - cx;
      const y = (clientY - rect.top) * (canvas.height / rect.height) - cy;
      return Math.atan2(y, x);
    }

    function onPointerDown(e) {
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const radius = Math.min(w, h) * 0.44;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = (clientX - rect.left) * (canvas.width / rect.width) - cx;
      const y = (clientY - rect.top) * (canvas.height / rect.height) - cy;
      const dist = Math.sqrt(x * x + y * y);
      if (dist > radius) return; // only inside circle

      s.isDragging = true;
      s.manualVelocity = 0;
      s.lastPointerAngle = getPointerAngle(e, cx, cy);
      s.lastPointerTime = performance.now();
    }

    function onPointerMove(e) {
      if (!s.isDragging) return;
      e.preventDefault();
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const nowAngle = getPointerAngle(e, cx, cy);
      const now = performance.now();
      let delta = nowAngle - s.lastPointerAngle;
      // Wrap delta to [-PI, PI]
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      s.angle += delta;
      const dt = Math.max(now - s.lastPointerTime, 1);
      s.manualVelocity = delta / dt * 16; // scale to per-frame
      s.lastPointerAngle = nowAngle;
      s.lastPointerTime = now;
    }

    function onPointerUp() {
      s.isDragging = false;
    }

    canvas.addEventListener("mousedown", onPointerDown);
    canvas.addEventListener("mousemove", onPointerMove);
    canvas.addEventListener("mouseup", onPointerUp);
    canvas.addEventListener("mouseleave", onPointerUp);
    canvas.addEventListener("touchstart", onPointerDown, { passive: true });
    canvas.addEventListener("touchmove", onPointerMove, { passive: false });
    canvas.addEventListener("touchend", onPointerUp);

    // --- Sand ridge accumulation along the blade ---
    let lastAngle = s.angle;
    let frameCount = 0;

    function updateSandRidge(currentAngle) {
      frameCount++;
      if (frameCount % 3 !== 0) return;
      const swept = currentAngle - lastAngle;
      lastAngle = currentAngle;
      const speed = Math.abs(swept);
      if (speed < 0.0005) return;

      // The rake (0..PI half) pushes sand onto the blade line.
      // Sand builds up more near the tips (t≈0 and t≈1) and the outer half of the blade.
      s.sandRidge.forEach(p => {
        const distFromTip = Math.min(p.t, 1 - p.t); // 0 at tips, 0.5 at center
        const rimBias = 1 - distFromTip * 1.4; // more accumulation near rim tips
        // Skip center zone (pivot knob area)
        if (distFromTip < 0.08) return;
        p.size = Math.min(p.size + speed * 18 * rimBias, 14);
      });

      // Smoother half slowly flattens the ridge back down
      s.sandRidge.forEach(p => {
        p.size = Math.max(p.size - speed * 3, 0.5);
      });
    }

    function draw() {
      animId = requestAnimationFrame(draw);
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const radius = Math.min(w, h) * 0.44;

      // Advance rotation
      if (!s.isDragging) {
        if (s.isAuto) {
          s.angle += s.autoSpeed;
        } else {
          // coast with friction
          s.angle += s.manualVelocity;
          s.manualVelocity *= 0.96;
        }
      }

      updateSandRidge(s.angle);
      const angle = s.angle;
      const grooves = s.grooves;

      // --- Background pebbles ---
      ctx.fillStyle = "#c8c4bc";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 80; i++) {
        const px = ((i * 137.5) % 1) * w;
        const py = ((i * 97.3) % 1) * h;
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

      // --- Outer ring ---
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 18, 0, Math.PI * 2);
      const ringGrad = ctx.createRadialGradient(cx, cy, radius + 10, cx, cy, radius + 20);
      ringGrad.addColorStop(0, "#2a2620");
      ringGrad.addColorStop(1, "#1a1510");
      ctx.fillStyle = ringGrad;
      ctx.fill();

      // Clip to sand circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Sand base
      const sandGrad = ctx.createRadialGradient(cx - radius * 0.1, cy - radius * 0.1, 0, cx, cy, radius);
      sandGrad.addColorStop(0, "#f0ebe0");
      sandGrad.addColorStop(0.6, "#e8e2d4");
      sandGrad.addColorStop(1, "#d8d2c4");
      ctx.fillStyle = sandGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // --- Sand ridge along the blade (rotates with the blade) ---
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      // blade goes from -radius to +radius along x-axis
      s.sandRidge.forEach(p => {
        const bx = -radius + p.t * radius * 2; // position along blade
        const distFromTip = Math.min(p.t, 1 - p.t);
        if (distFromTip < 0.08) return; // skip pivot area
        const h = p.size;
        // Draw a soft sand mound sitting on top of the blade line
        // Mound sits above the blade (negative y = upward in rotated space)
        const mg = ctx.createRadialGradient(bx, -h * 0.5, 0, bx, 0, h * 2);
        mg.addColorStop(0, `rgba(225,215,190,0.85)`);
        mg.addColorStop(0.5, `rgba(205,195,168,0.55)`);
        mg.addColorStop(1, `rgba(190,180,155,0)`);
        ctx.beginPath();
        ctx.ellipse(bx, 0, h * 1.8, h * 0.9, 0, 0, Math.PI * 2);
        ctx.fillStyle = mg;
        ctx.fill();
      });
      ctx.restore();

      // --- Rotating blade ---
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Raked half
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, 0, Math.PI);
      ctx.closePath();
      ctx.clip();

      for (let i = 1; i <= grooves; i++) {
        const r = (i / grooves) * radius * 0.97;
        const depth = 0.5 + (i % 3) * 0.15;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI);
        ctx.strokeStyle = `rgba(140,130,110,${0.35 * depth})`;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, r - 1.5, 0, Math.PI);
        ctx.strokeStyle = `rgba(255,252,242,${0.55 * depth})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, r + 1.2, 0, Math.PI);
        ctx.strokeStyle = `rgba(100,90,70,${0.18 * depth})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.restore();

      // Smooth half
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      for (let i = 1; i <= grooves; i++) {
        const r = (i / grooves) * radius * 0.97;
        ctx.beginPath();
        ctx.arc(0, 0, r, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `rgba(200,195,180,0.12)`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.restore();

      // Dividing blade
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
      ctx.beginPath();
      ctx.moveTo(-radius, -1);
      ctx.lineTo(radius, -1);
      ctx.strokeStyle = "rgba(255,252,240,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore(); // rotation

      // Center pivot
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

      // Rim shadow
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
      canvas.removeEventListener("mousedown", onPointerDown);
      canvas.removeEventListener("mousemove", onPointerMove);
      canvas.removeEventListener("mouseup", onPointerUp);
      canvas.removeEventListener("mouseleave", onPointerUp);
      canvas.removeEventListener("touchstart", onPointerDown);
      canvas.removeEventListener("touchmove", onPointerMove);
      canvas.removeEventListener("touchend", onPointerUp);
    };
  }, []);

  // Sync speed + auto mode to ref
  useEffect(() => {
    stateRef.current.autoSpeed = speeds[speed];
    stateRef.current.isAuto = isAuto;
  }, [speed, isAuto]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#c8c4bc]">
      <canvas ref={canvasRef} className="w-full h-full" style={{ cursor: isAuto ? "default" : "grab" }} />
      <div className="absolute bottom-4 flex gap-2 items-center">
        <button
          onClick={() => setIsAuto(a => !a)}
          className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all ${
            isAuto ? "bg-white/30 text-white" : "bg-black/30 text-white/70"
          }`}
        >
          {isAuto ? "⟳ Auto" : "✋ Manual"}
        </button>
        <div className="w-px h-4 bg-white/20" />
        {Object.keys(speeds).map(s => (
          <button
            key={s}
            onClick={() => { setSpeed(s); setIsAuto(true); }}
            className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all capitalize ${
              speed === s && isAuto ? "bg-white/30 text-white" : "bg-black/20 text-white/50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
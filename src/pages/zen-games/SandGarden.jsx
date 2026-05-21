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
    isAuto: true,
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

    // Sand is stored as a height map around the circle rim.
    // NUM_SECTORS sectors, each holding a "height" 0..1
    // The blade pushes sand up as it sweeps, sand slowly settles back to rest height.
    const NUM_SECTORS = 360;
    const REST_HEIGHT = 0.18;       // natural resting sand height
    const MAX_HEIGHT = 1.0;         // max pile height
    const SETTLE_RATE = 0.0004;     // how fast sand settles back to rest (per frame)
    const PUSH_WIDTH = 18;          // how many sectors the blade pushes ahead (degrees)
    const RAKE_WIDTH = 30;          // how wide the rake flattens behind it (degrees)

    // Initialize sand at rest
    const sandHeight = new Float32Array(NUM_SECTORS).fill(REST_HEIGHT);

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
      if (Math.sqrt(x * x + y * y) > radius) return;
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
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      s.angle += delta;
      const dt = Math.max(now - s.lastPointerTime, 1);
      s.manualVelocity = delta / dt * 16;
      s.lastPointerAngle = nowAngle;
      s.lastPointerTime = now;
    }

    function onPointerUp() { s.isDragging = false; }

    canvas.addEventListener("mousedown", onPointerDown);
    canvas.addEventListener("mousemove", onPointerMove);
    canvas.addEventListener("mouseup", onPointerUp);
    canvas.addEventListener("mouseleave", onPointerUp);
    canvas.addEventListener("touchstart", onPointerDown, { passive: true });
    canvas.addEventListener("touchmove", onPointerMove, { passive: false });
    canvas.addEventListener("touchend", onPointerUp);

    // Convert angle (radians) to sector index
    function angleToSector(a) {
      const deg = ((a * 180 / Math.PI) % 360 + 360) % 360;
      return Math.floor(deg) % NUM_SECTORS;
    }

    let lastBladeAngle = s.angle;

    function updateSand(bladeAngle) {
      const swept = bladeAngle - lastBladeAngle;
      lastBladeAngle = bladeAngle;
      const speed = Math.abs(swept);

      // Settle all sand slowly back toward rest height
      for (let i = 0; i < NUM_SECTORS; i++) {
        if (sandHeight[i] < REST_HEIGHT) {
          sandHeight[i] = Math.min(sandHeight[i] + SETTLE_RATE, REST_HEIGHT);
        } else if (sandHeight[i] > REST_HEIGHT) {
          sandHeight[i] = Math.max(sandHeight[i] - SETTLE_RATE * 0.5, REST_HEIGHT);
        }
      }

      if (speed < 0.0002) return;

      // The blade divides space into two halves:
      // "rake" half (0..PI from blade angle) creates grooves + pushes sand to blade
      // The blade itself acts as a bulldozer — sand piles up just ahead of the leading edge

      const bladeDir = swept > 0 ? 1 : -1; // rotation direction

      // Leading edge of blade: the sector the blade is sweeping INTO
      const leadingSector = angleToSector(bladeAngle + bladeDir * 0.01);

      // Push sand ahead of blade — collect from just behind and pile just ahead
      for (let i = 1; i <= PUSH_WIDTH; i++) {
        const behind = (leadingSector - bladeDir * i + NUM_SECTORS * 2) % NUM_SECTORS;
        const ahead = (leadingSector + bladeDir * i + NUM_SECTORS * 2) % NUM_SECTORS;

        // Scoop from behind the leading edge
        const scoop = sandHeight[behind] * speed * 3.5;
        sandHeight[behind] = Math.max(sandHeight[behind] - scoop, 0);

        // Pile ahead of leading edge, weighted toward just at the blade
        const weight = 1 - (i - 1) / PUSH_WIDTH;
        sandHeight[ahead] = Math.min(sandHeight[ahead] + scoop * weight, MAX_HEIGHT);
      }

      // Rake half: flatten sand in the swept zone (grooves smooth sand down)
      const rakeStart = angleToSector(bladeAngle);
      for (let i = 1; i <= RAKE_WIDTH; i++) {
        const sector = (rakeStart - bladeDir * i + NUM_SECTORS * 2) % NUM_SECTORS;
        // Rake gradually levels sand toward a low flat profile
        sandHeight[sector] = sandHeight[sector] * (1 - speed * 2) + 0.04 * speed * 2;
      }
    }

    const GROOVES = 18;

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
          s.angle += s.manualVelocity;
          s.manualVelocity *= 0.96;
        }
      }

      updateSand(s.angle);
      const angle = s.angle;

      // --- Background ---
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

      // --- Draw sand height map as rim piles ---
      // Each sector renders a soft mound near the rim proportional to its height
      for (let i = 0; i < NUM_SECTORS; i++) {
        const h_val = sandHeight[i];
        if (h_val < 0.05) continue;

        const sectorAngle = (i / NUM_SECTORS) * Math.PI * 2;
        const nextAngle = ((i + 1) / NUM_SECTORS) * Math.PI * 2;
        const midAngle = (sectorAngle + nextAngle) / 2;

        // Pile size scales with height
        const pileH = h_val * 16; // max 16px height
        const rimR = radius * 0.82 + pileH * 0.5;
        const px = cx + Math.cos(midAngle) * rimR;
        const py = cy + Math.sin(midAngle) * rimR;

        const alpha = Math.min(h_val * 1.2, 0.92);
        const spread = (radius * 0.022) + pileH * 0.4;

        const mg = ctx.createRadialGradient(px, py, 0, px, py, spread * 2);
        mg.addColorStop(0, `rgba(218,208,185,${alpha})`);
        mg.addColorStop(0.4, `rgba(200,190,165,${alpha * 0.7})`);
        mg.addColorStop(1, `rgba(185,175,150,0)`);

        ctx.beginPath();
        ctx.ellipse(px, py, spread * 2, spread, midAngle + Math.PI / 2, 0, Math.PI * 2);
        ctx.fillStyle = mg;
        ctx.fill();
      }

      // --- Rotating blade ---
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Raked half (0 to PI)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, 0, Math.PI);
      ctx.closePath();
      ctx.clip();
      for (let i = 1; i <= GROOVES; i++) {
        const r = (i / GROOVES) * radius * 0.97;
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

      // Smooth half (PI to 2PI)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      for (let i = 1; i <= GROOVES; i++) {
        const r = (i / GROOVES) * radius * 0.97;
        ctx.beginPath();
        ctx.arc(0, 0, r, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `rgba(200,195,180,0.12)`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.restore();

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
        {Object.keys(speeds).map(k => (
          <button
            key={k}
            onClick={() => { setSpeed(k); setIsAuto(true); }}
            className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all capitalize ${
              speed === k && isAuto ? "bg-white/30 text-white" : "bg-black/20 text-white/50"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
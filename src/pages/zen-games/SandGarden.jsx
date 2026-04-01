import { useState, useRef, useEffect } from "react";

export default function SandGarden() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    // Sand background
    ctx.fillStyle = "#f5e6d3";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    // Subtle noise texture
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * canvas.offsetWidth;
      const y = Math.random() * canvas.offsetHeight;
      ctx.fillStyle = `rgba(180, 160, 130, ${Math.random() * 0.3})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const draw = (e) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);
    if (lastPos.current) {
      ctx.strokeStyle = "rgba(160, 140, 110, 0.6)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      // Sand displacement effect
      ctx.strokeStyle = "rgba(220, 200, 170, 0.4)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  const startDrawing = (e) => {
    setDrawing(true);
    lastPos.current = getPos(e);
  };

  const stopDrawing = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-amber-800/50">Draw in the sand</p>
    </div>
  );
}
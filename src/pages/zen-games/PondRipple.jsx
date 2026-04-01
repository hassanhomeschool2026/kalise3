import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PondRipple() {
  const [ripples, setRipples] = useState([]);

  const createRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev.slice(-10), { id, x, y }]);
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-2xl cursor-pointer"
      style={{ background: "linear-gradient(180deg, #e0e7ff 0%, #a5b4fc 40%, #818cf8 70%, #6366f1 100%)" }}
      onClick={createRipple}
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ width: 0, height: 0, opacity: 0.6 }}
            animate={{ width: 200, height: 200, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            onAnimationComplete={() => setRipples((prev) => prev.filter((rr) => rr.id !== r.id))}
            style={{ left: r.x - 100, top: r.y - 100 }}
            className="absolute rounded-full border-2 border-white/40 pointer-events-none"
          />
        ))}
      </AnimatePresence>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/60">Tap anywhere to create ripples</p>
    </div>
  );
}
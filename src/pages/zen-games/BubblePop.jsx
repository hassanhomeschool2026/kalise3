import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BubblePop() {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);

  const spawnBubble = useCallback(() => {
    const id = Date.now() + Math.random();
    const size = 30 + Math.random() * 50;
    const x = Math.random() * (window.innerWidth - 100) + 20;
    const hue = 250 + Math.random() * 60;
    setBubbles((prev) => [...prev.slice(-15), { id, x, size, hue }]);
  }, []);

  useEffect(() => {
    const interval = setInterval(spawnBubble, 800);
    return () => clearInterval(interval);
  }, [spawnBubble]);

  const pop = (id) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + 1);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-purple-50 to-purple-100 rounded-2xl">
      <div className="absolute top-3 right-3 bg-white/80 rounded-full px-3 py-1 text-xs font-medium text-primary">
        {score} popped
      </div>
      <AnimatePresence>
        {bubbles.map((b) => (
          <motion.button
            key={b.id}
            initial={{ y: 500, opacity: 0, scale: 0 }}
            animate={{ y: -100, opacity: [0, 0.8, 0.8, 0], scale: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 6, ease: "linear" }}
            onClick={() => pop(b.id)}
            style={{ left: b.x, width: b.size, height: b.size }}
            className="absolute rounded-full cursor-pointer"
          >
            <div
              className="w-full h-full rounded-full opacity-60"
              style={{ background: `radial-gradient(circle at 30% 30%, hsl(${b.hue}, 70%, 80%), hsl(${b.hue}, 60%, 55%))` }}
            />
          </motion.button>
        ))}
      </AnimatePresence>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-muted-foreground">Tap the bubbles</p>
    </div>
  );
}
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { initRain, drawRain } from "./scenes/RainScene";
import { initOcean, drawOcean } from "./scenes/OceanScene";
import { initFire, drawFire } from "./scenes/FireScene";
import { initForest, drawForest } from "./scenes/ForestScene";
import { initNight, drawNight } from "./scenes/NightScene";
import { initStream, drawStream } from "./scenes/StreamScene";
import { initWind, drawWind } from "./scenes/WindChimeScene";
import { initThunder, drawThunder } from "./scenes/ThunderScene";

const SCENES = {
  rain: { init: initRain, draw: drawRain },
  ocean: { init: initOcean, draw: drawOcean },
  fire: { init: initFire, draw: drawFire },
  forest: { init: initForest, draw: drawForest },
  night: { init: initNight, draw: drawNight },
  stream: { init: initStream, draw: drawStream },
  wind: { init: initWind, draw: drawWind },
  thunder: { init: initThunder, draw: drawThunder },
};

export default function AmbienceCard({ scene, isPlaying, onClick }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = SCENES[scene.id];
    if (!s) return;
    const w = canvas.width;
    const h = canvas.height;
    stateRef.current = s.init(w, h);

    const loop = () => {
      s.draw(ctx, w, h, stateRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scene.id]);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.025, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="relative w-full overflow-hidden rounded-3xl text-left focus:outline-none group"
      style={{ aspectRatio: "16/10" }}
    >
      {/* Live canvas background */}
      <canvas
        ref={canvasRef}
        width={480}
        height={300}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: "block" }}
      />

      {/* Cinematic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* Playing pulse ring */}
      {isPlaying && (
        <div className="absolute inset-0 rounded-3xl border-2 border-white/40 animate-pulse" />
      )}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm leading-tight drop-shadow-lg">
              {scene.name}
            </h3>
            <p className="text-white/55 text-[11px] mt-0.5 drop-shadow">{scene.desc}</p>
          </div>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-all duration-300 ${
            isPlaying
              ? "bg-white/30 backdrop-blur-sm border border-white/40"
              : "bg-black/30 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100"
          }`}>
            {isPlaying ? (
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" />
                <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
              </div>
            ) : (
              <Play className="w-3.5 h-3.5 text-white ml-0.5" />
            )}
          </div>
        </div>
      </div>

      {/* Glassmorphism edge sheen */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 pointer-events-none" />
    </motion.button>
  );
}
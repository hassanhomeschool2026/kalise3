import { useEffect, useRef } from "react";
import { initRain, drawRain } from "./scenes/RainScene";
import { initOcean, drawOcean } from "./scenes/OceanScene";
import { initFire, drawFire } from "./scenes/FireScene";
import { initForest, drawForest } from "./scenes/ForestScene";
import { initNight, drawNight } from "./scenes/NightScene";
import { initStream, drawStream } from "./scenes/StreamScene";
import { initWind, drawWind } from "./scenes/WindChimeScene";
import { initThunder, drawThunder } from "./scenes/ThunderScene";

const SCENES = {
  rain:    { init: initRain,    draw: drawRain },
  ocean:   { init: initOcean,   draw: drawOcean },
  fire:    { init: initFire,    draw: drawFire },
  forest:  { init: initForest,  draw: drawForest },
  night:   { init: initNight,   draw: drawNight },
  stream:  { init: initStream,  draw: drawStream },
  wind:    { init: initWind,    draw: drawWind },
  thunder: { init: initThunder, draw: drawThunder },
};

export default function AmbienceVisual({ sceneId, width = 400, height = 400, className = "" }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const scene = SCENES[sceneId];
    if (!scene) return;

    const w = canvas.width;
    const h = canvas.height;
    stateRef.current = scene.init(w, h);

    const loop = () => {
      scene.draw(ctx, w, h, stateRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, [sceneId]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ display: "block" }}
    />
  );
}
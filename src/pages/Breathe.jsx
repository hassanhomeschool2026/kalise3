import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PATTERNS = [
  { name: "Box Breathing", inhale: 4, hold1: 4, exhale: 4, hold2: 4, desc: "Equal parts, calming and centering" },
  { name: "4-7-8 Relaxation", inhale: 4, hold1: 7, exhale: 8, hold2: 0, desc: "Activates your rest response" },
  { name: "Simple Calm", inhale: 4, hold1: 2, exhale: 6, hold2: 0, desc: "Easy and soothing for beginners" },
];

export default function Breathe() {
  const [pattern, setPattern] = useState(null);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState("inhale");
  const [timer, setTimer] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active || !pattern) return;

    const phases = [
      { name: "inhale", duration: pattern.inhale },
      ...(pattern.hold1 > 0 ? [{ name: "hold", duration: pattern.hold1 }] : []),
      { name: "exhale", duration: pattern.exhale },
      ...(pattern.hold2 > 0 ? [{ name: "hold", duration: pattern.hold2 }] : []),
    ];

    let phaseIndex = 0;
    let count = phases[0].duration;
    setPhase(phases[0].name);
    setTimer(count);

    intervalRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        phaseIndex++;
        if (phaseIndex >= phases.length) {
          phaseIndex = 0;
          setCycles((c) => c + 1);
        }
        count = phases[phaseIndex].duration;
        setPhase(phases[phaseIndex].name);
      }
      setTimer(count);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [active, pattern]);

  const stop = () => {
    setActive(false);
    clearInterval(intervalRef.current);
    setPhase("inhale");
    setTimer(0);
    setCycles(0);
  };

  if (!pattern) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="font-heading text-2xl font-bold mb-2">Guided Breathing</h1>
        <p className="text-muted-foreground text-sm mb-6">Pick a pattern. Let's slow everything down.</p>
        <div className="space-y-3">
          {PATTERNS.map((p) => (
            <button
              key={p.name}
              onClick={() => setPattern(p)}
              className="w-full p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all text-left"
            >
              <h3 className="font-semibold text-sm">{p.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
              <p className="text-xs text-primary mt-1">
                {p.inhale}s in · {p.hold1 > 0 ? `${p.hold1}s hold · ` : ""}{p.exhale}s out{p.hold2 > 0 ? ` · ${p.hold2}s hold` : ""}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const phaseLabel = phase === "inhale" ? "Breathe in" : phase === "exhale" ? "Breathe out" : "Hold";
  const circleScale = phase === "inhale" ? 1.4 : phase === "exhale" ? 0.8 : phase === "hold" && timer > 0 ? 1.4 : 1;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto flex flex-col items-center min-h-[70vh] justify-center">
      <button onClick={() => { stop(); setPattern(null); }} className="self-start inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <p className="text-sm text-muted-foreground mb-2">{pattern.name}</p>

      {/* Breathing circle */}
      <div className="relative w-56 h-56 flex items-center justify-center mb-8">
        <motion.div
          animate={{ scale: active ? circleScale : 1 }}
          transition={{ duration: phase === "inhale" ? pattern.inhale : phase === "exhale" ? pattern.exhale : 0.3, ease: "easeInOut" }}
          className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-300/50 to-purple-500/50 flex items-center justify-center"
        >
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-400/60 to-purple-600/60 flex items-center justify-center">
            <div className="text-center">
              {active ? (
                <>
                  <p className="text-2xl font-bold text-white">{timer}</p>
                  <p className="text-xs text-white/80">{phaseLabel}</p>
                </>
              ) : (
                <p className="text-sm text-white/80">Ready</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {active && <p className="text-sm text-muted-foreground mb-6">Cycle {cycles + 1}</p>}

      <button
        onClick={() => active ? stop() : setActive(true)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        {active ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const PATTERNS = [
  { name: "Box Breathing", inhale: 4, hold1: 4, exhale: 4, hold2: 4, desc: "Equal parts, calming and centering" },
  { name: "4-7-8 Relaxation", inhale: 4, hold1: 7, exhale: 8, hold2: 0, desc: "Activates your rest response" },
  { name: "Simple Calm", inhale: 4, hold1: 2, exhale: 6, hold2: 0, desc: "Easy and soothing for beginners" },
];

// Synthesize a soft tone using Web Audio API
function playTone(audioCtx, frequency, duration, type = "sine", fadeOut = true) {
  if (!audioCtx) return;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.05);
  if (fadeOut) {
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
  } else {
    gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
  }
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration);
}

const PHASE_SOUNDS = {
  inhale: (ctx) => playTone(ctx, 220, 0.6, "sine"),    // soft low tone
  hold:   (ctx) => playTone(ctx, 330, 0.4, "sine"),    // mid tone
  exhale: (ctx) => playTone(ctx, 180, 0.6, "sine"),    // soft lower tone
};

export default function Breathe() {
  const [pattern, setPattern] = useState(null);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState("inhale");
  const [timer, setTimer] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

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

    // Play sound for first phase
    if (soundEnabled) PHASE_SOUNDS[phases[0].name]?.(getAudioCtx());

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
        if (soundEnabled) PHASE_SOUNDS[phases[phaseIndex].name]?.(getAudioCtx());
      }
      setTimer(count);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [active, pattern, soundEnabled]);

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
  const circleScale = phase === "inhale" ? 1.35 : phase === "exhale" ? 0.75 : 1.35;
  const phaseDuration = phase === "inhale" ? pattern.inhale : phase === "exhale" ? pattern.exhale : 0.4;

  const phaseColor = phase === "inhale"
    ? { from: "#a78bfa", to: "#7c3aed" }
    : phase === "exhale"
    ? { from: "#c4b5fd", to: "#a78bfa" }
    : { from: "#818cf8", to: "#6366f1" };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto flex flex-col items-center min-h-[70vh] justify-center">
      {/* Top bar */}
      <div className="self-stretch flex items-center justify-between mb-8">
        <button
          onClick={() => { stop(); setPattern(null); }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => setSoundEnabled((s) => !s)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title={soundEnabled ? "Mute guidance" : "Enable guidance"}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      <p className="text-sm text-muted-foreground mb-8">{pattern.name}</p>

      {/* 3D Orb */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-10">
        {/* Outer glow ring */}
        <motion.div
          animate={{ scale: active ? circleScale : 1, opacity: active ? 0.35 : 0.15 }}
          transition={{ duration: phaseDuration, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${phaseColor.from}55 0%, transparent 70%)`,
          }}
        />
        {/* Mid ring */}
        <motion.div
          animate={{ scale: active ? circleScale * 0.85 : 0.85, opacity: active ? 0.5 : 0.2 }}
          transition={{ duration: phaseDuration, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${phaseColor.from}88 0%, transparent 65%)`,
          }}
        />
        {/* Core orb */}
        <motion.div
          animate={{ scale: active ? circleScale * 0.6 : 0.6 }}
          transition={{ duration: phaseDuration, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full flex items-center justify-center"
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle at 38% 35%, ${phaseColor.from}, ${phaseColor.to} 70%)`,
              boxShadow: `0 0 40px 8px ${phaseColor.from}66, inset 0 -6px 20px rgba(0,0,0,0.15), inset 0 6px 12px rgba(255,255,255,0.25)`,
            }}
          />
        </motion.div>

        {/* Text inside orb */}
        <div className="relative z-10 text-center pointer-events-none select-none">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-4xl font-bold text-white drop-shadow">{timer}</p>
                <p className="text-xs text-white/80 mt-1 tracking-widest uppercase">{phaseLabel}</p>
              </motion.div>
            ) : (
              <motion.p
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-white/70"
              >
                Ready
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {active && (
        <p className="text-xs text-muted-foreground mb-6 tracking-wide">Cycle {cycles + 1}</p>
      )}

      <button
        onClick={() => active ? stop() : setActive(true)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
      >
        {active ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>
    </div>
  );
}
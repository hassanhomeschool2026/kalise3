import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, Pause, Clock, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AmbienceVisual from "../components/ambience/AmbienceVisual";
import { AmbienceEngine } from "../components/ambience/AmbienceAudio";

const SOUNDSCAPES = [
  { id: "rain",    name: "Gentle Rain",      desc: "Soft rainfall on leaves",         bg: "from-slate-700 to-blue-900" },
  { id: "ocean",   name: "Ocean at Night",   desc: "Waves under a moonlit sky",       bg: "from-blue-900 to-indigo-900" },
  { id: "forest",  name: "Deep Forest",      desc: "Birds, wind, and fireflies",      bg: "from-green-900 to-emerald-950" },
  { id: "fire",    name: "Crackling Fire",   desc: "Warm fireplace in a dark room",   bg: "from-orange-900 to-red-950" },
  { id: "night",   name: "Night Sky",        desc: "Crickets under a full moon",      bg: "from-gray-950 to-indigo-950" },
  { id: "stream",  name: "Mountain Stream",  desc: "Water rushing over cool stones",  bg: "from-teal-900 to-cyan-950" },
  { id: "wind",    name: "Wind Chimes",      desc: "Delicate chimes in a soft breeze",bg: "from-violet-900 to-purple-950" },
  { id: "thunder", name: "Distant Thunder",  desc: "Stormy skies rolling in",         bg: "from-slate-950 to-gray-900" },
];

const DURATIONS = [5, 10, 15, 30, 60];

const engineRef = { current: null };

export default function Ambience() {
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(15);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const intervalRef = useRef(null);

  // Single engine instance
  if (!engineRef.current) engineRef.current = new AmbienceEngine();
  const engine = engineRef.current;

  useEffect(() => {
    if (playing) {
      engine.play(selected.id, muted ? 0 : 0.5);
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= duration * 60) {
            setPlaying(false);
            engine.stop();
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      engine.stop();
      clearInterval(intervalRef.current);
    }
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [playing]);

  useEffect(() => {
    engine.setVolume(muted ? 0 : 0.5);
  }, [muted]);

  const handleSelect = (s) => {
    setSelected(s);
    setPlaying(false);
    setElapsed(0);
  };

  const handleBack = () => {
    engine.stop();
    setPlaying(false);
    setSelected(null);
    setElapsed(0);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const progress = duration > 0 ? elapsed / (duration * 60) : 0;

  // Selection screen
  if (!selected) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="font-heading text-2xl font-bold mb-1">Ambience</h1>
        <p className="text-muted-foreground text-sm mb-6">Step into a world that slows everything down.</p>
        <div className="grid grid-cols-2 gap-3">
          {SOUNDSCAPES.map((s) => (
            <motion.button
              key={s.id}
              onClick={() => handleSelect(s)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br ${s.bg} text-white text-left h-28 flex flex-col justify-end shadow-lg`}
            >
              <h3 className="font-semibold text-sm leading-tight">{s.name}</h3>
              <p className="text-[10px] text-white/60 mt-0.5">{s.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Player screen
  return (
    <div className={`min-h-screen bg-gradient-to-b ${selected.bg} flex flex-col`}>
      {/* Top controls */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <button
          onClick={handleBack}
          className="text-white/70 hover:text-white flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => setMuted((m) => !m)} className="text-white/70 hover:text-white">
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Canvas visual */}
      <div className="flex-1 px-4 pb-4 flex flex-col">
        <div className="rounded-3xl overflow-hidden flex-1 min-h-0 shadow-2xl" style={{ maxHeight: "55vmax" }}>
          <AmbienceVisual sceneId={selected.id} playing={playing} />
        </div>

        {/* Info */}
        <div className="mt-5 text-center">
          <h2 className="font-heading text-xl font-semibold text-white">{selected.name}</h2>
          <p className="text-white/50 text-xs mt-0.5">{selected.desc}</p>
        </div>

        {/* Progress bar */}
        {playing && (
          <div className="mt-4 px-2">
            <div className="h-0.5 bg-white/15 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/50 rounded-full"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>{formatTime(elapsed)}</span>
              <span>{formatTime(duration * 60)}</span>
            </div>
          </div>
        )}

        {/* Duration selector */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Clock className="w-3.5 h-3.5 text-white/40" />
          <div className="flex gap-1.5">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => { setDuration(d); setElapsed(0); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  duration === d
                    ? "bg-white/20 text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        {/* Play button */}
        <div className="flex justify-center mt-5 mb-6">
          <motion.button
            onClick={() => { setPlaying((p) => !p); if (!playing) setElapsed(0); }}
            whileTap={{ scale: 0.92 }}
            className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white flex items-center justify-center shadow-xl hover:bg-white/25 transition-colors"
          >
            <AnimatePresence mode="wait">
              {playing ? (
                <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Pause className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Play className="w-6 h-6 ml-0.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
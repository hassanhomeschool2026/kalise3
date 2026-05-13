import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Volume2, VolumeX, Clock, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AmbienceCard from "../components/ambience/AmbienceCard";
import AmbienceVisual from "../components/ambience/AmbienceVisual";
import { AmbienceEngine } from "../components/ambience/AmbienceAudio";

const SOUNDSCAPES = [
  { id: "rain",    name: "Gentle Rain",      desc: "Rainfall on forest leaves" },
  { id: "ocean",   name: "Ocean at Night",   desc: "Waves under a moonlit sky" },
  { id: "fire",    name: "Crackling Fire",   desc: "Warm fireplace in a dark room" },
  { id: "forest",  name: "Deep Forest",      desc: "Fireflies and drifting mist" },
  { id: "night",   name: "Night Sky",        desc: "Stars and crickets at midnight" },
  { id: "stream",  name: "Mountain Stream",  desc: "Water rushing over cool stones" },
  { id: "wind",    name: "Wind Chimes",      desc: "Cozy porch, lantern glow" },
  { id: "thunder", name: "Distant Thunder",  desc: "Storm rolling in over dark skies" },
];

const DURATIONS = [
  { label: "5 min",  value: 5 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hr",   value: 60 },
  { label: "∞",      value: 999 },
];

const engineSingleton = { current: null };

export default function Ambience() {
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(15);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  if (!engineSingleton.current) engineSingleton.current = new AmbienceEngine();
  const engine = engineSingleton.current;

  // Cleanup on unmount
  useEffect(() => () => { engine.stop(); clearInterval(intervalRef.current); }, []);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (playing && selected) {
      engine.play(selected.id, muted ? 0 : 0.5);
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const limit = duration * 60;
          if (duration !== 999 && prev >= limit) {
            setPlaying(false);
            engine.stop();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      engine.stop();
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, selected]);

  useEffect(() => { engine.setVolume(muted ? 0 : 0.5); }, [muted]);

  const handleSelect = (s) => {
    setSelected(s);
    setElapsed(0);
    setPlaying(false);
  };

  const handleBack = () => {
    engine.stop();
    setPlaying(false);
    setSelected(null);
    setElapsed(0);
  };

  const togglePlay = () => {
    if (!playing) setElapsed(0);
    setPlaying((p) => !p);
  };

  const formatTime = (s) => {
    if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const progress = duration !== 999 ? Math.min(elapsed / (duration * 60), 1) : 0;

  // ── PLAYER SCREEN ──────────────────────────────────────────────
  if (selected) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden flex flex-col">
        {/* Full-screen canvas */}
        <div className="absolute inset-0">
          <AmbienceVisual
            sceneId={selected.id}
            width={800}
            height={1000}
            className="w-full h-full object-cover"
          />
          {/* Multi-layer cinematic vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Scene title */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-5 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="font-heading text-3xl font-semibold text-white drop-shadow-2xl tracking-tight">
              {selected.name}
            </h2>
            <p className="text-white/45 text-sm mt-1">{selected.desc}</p>
          </motion.div>

          {/* Progress */}
          {playing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
              {duration !== 999 ? (
                <div>
                  <div className="h-px bg-white/15 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-white/50 rounded-full"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-white/35">
                    <span>{formatTime(elapsed)}</span>
                    <span>{formatTime(duration * 60)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-white/35 text-xs text-center">{formatTime(elapsed)} elapsed</p>
              )}
            </motion.div>
          )}

          {/* Duration picker */}
          <div className="flex items-center gap-1.5 mb-6">
            <Clock className="w-3.5 h-3.5 text-white/35 flex-shrink-0" />
            <div className="flex gap-1.5 flex-wrap">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => { setDuration(d.value); setElapsed(0); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    duration === d.value
                      ? "bg-white/25 text-white backdrop-blur-sm"
                      : "text-white/40 hover:text-white/65"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Play / Pause */}
          <div className="flex justify-center">
            <motion.button
              onClick={togglePlay}
              whileTap={{ scale: 0.9 }}
              className="relative w-20 h-20 rounded-full flex items-center justify-center"
            >
              {/* Glow ring */}
              {playing && (
                <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-30" />
              )}
              <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20" />
              <AnimatePresence mode="wait">
                {playing ? (
                  <motion.div key="pause" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="relative z-10 flex gap-1.5">
                    <div className="w-1.5 h-6 bg-white rounded-full" />
                    <div className="w-1.5 h-6 bg-white rounded-full" />
                  </motion.div>
                ) : (
                  <motion.div key="play" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="relative z-10 ml-1">
                    <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[18px] border-t-transparent border-b-transparent border-l-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ── SELECTION SCREEN ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black">
      {/* Hero header */}
      <div className="relative px-5 pt-6 pb-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors text-sm mb-5">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="font-heading text-3xl font-semibold text-white tracking-tight">Ambience</h1>
        <p className="text-white/40 text-sm mt-1">Step into a world that slows everything down.</p>
      </div>

      {/* Featured scene — large hero card */}
      <div className="px-5 mb-4">
        <motion.div
          className="relative w-full overflow-hidden rounded-3xl cursor-pointer group"
          style={{ aspectRatio: "16/9" }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleSelect(SOUNDSCAPES[0])}
        >
          <AmbienceVisual
            sceneId={SOUNDSCAPES[0].id}
            width={800}
            height={450}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="absolute inset-0 ring-1 ring-white/10 rounded-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
            <div>
              <span className="text-white/50 text-[10px] font-medium uppercase tracking-widest mb-1 block">Featured</span>
              <h3 className="font-heading text-xl font-semibold text-white">{SOUNDSCAPES[0].name}</h3>
              <p className="text-white/50 text-xs mt-0.5">{SOUNDSCAPES[0].desc}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[14px] border-t-transparent border-b-transparent border-l-white ml-0.5" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scene grid — remaining 7 */}
      <div className="px-5 pb-10">
        <p className="text-white/25 text-[11px] uppercase tracking-widest mb-3 font-medium">All Scenes</p>
        <div className="grid grid-cols-2 gap-3">
          {SOUNDSCAPES.slice(1).map((s) => (
            <AmbienceCard
              key={s.id}
              scene={s}
              isPlaying={false}
              onClick={() => handleSelect(s)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Play, Pause, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const SOUNDSCAPES = [
  { id: "rain", name: "Gentle Rain", emoji: "🌧️", color: "from-blue-400/20 to-slate-500/20", desc: "Soft rainfall on leaves" },
  { id: "ocean", name: "Ocean Waves", emoji: "🌊", color: "from-cyan-400/20 to-blue-500/20", desc: "Waves meeting the shore" },
  { id: "forest", name: "Forest", emoji: "🌲", color: "from-green-400/20 to-emerald-500/20", desc: "Birds and rustling trees" },
  { id: "fire", name: "Crackling Fire", emoji: "🔥", color: "from-orange-400/20 to-red-500/20", desc: "Warm fireplace sounds" },
  { id: "night", name: "Night Sounds", emoji: "🌙", color: "from-indigo-400/20 to-purple-500/20", desc: "Crickets and gentle breeze" },
  { id: "stream", name: "Mountain Stream", emoji: "⛰️", color: "from-teal-400/20 to-cyan-500/20", desc: "Water flowing over stones" },
  { id: "wind", name: "Wind Chimes", emoji: "🎐", color: "from-violet-400/20 to-fuchsia-500/20", desc: "Delicate chimes in the wind" },
  { id: "thunder", name: "Distant Thunder", emoji: "⛈️", color: "from-slate-400/20 to-gray-500/20", desc: "Far-off rumbling storms" },
];

const DURATIONS = [5, 10, 15, 30, 60];

export default function Ambience() {
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(15);
  const [elapsed, setElapsed] = useState(0);
  const [repeat, setRepeat] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= duration * 60 && !repeat) {
            setPlaying(false);
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, duration, repeat]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!selected) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="font-heading text-2xl font-bold mb-2">Ambience</h1>
        <p className="text-muted-foreground text-sm mb-6">Soothing sounds to fill your space.</p>
        <div className="grid grid-cols-2 gap-3">
          {SOUNDSCAPES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className={`p-4 rounded-2xl border border-border/50 bg-gradient-to-br ${s.color} hover:border-primary/30 transition-all text-center`}
            >
              <span className="text-3xl block mb-2">{s.emoji}</span>
              <h3 className="text-sm font-semibold">{s.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto flex flex-col items-center min-h-[70vh] justify-center">
      <button onClick={() => { setSelected(null); setPlaying(false); setElapsed(0); }} className="self-start inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <span className="text-6xl mb-4">{selected.emoji}</span>
      <h2 className="font-heading text-xl font-semibold mb-1">{selected.name}</h2>
      <p className="text-sm text-muted-foreground mb-8">{selected.desc}</p>

      {/* Duration selector */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="flex gap-1.5">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => { setDuration(d); setElapsed(0); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                duration === d ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {d}m
            </button>
          ))}
        </div>
      </div>

      {/* Repeat toggle */}
      <button
        onClick={() => setRepeat(!repeat)}
        className={`text-xs px-3 py-1.5 rounded-full mb-6 transition-all ${
          repeat ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
        }`}
      >
        {repeat ? "🔁 Repeating" : "Play once"}
      </button>

      {/* Timer */}
      {playing && (
        <p className="text-2xl font-bold mb-6 tabular-nums">{formatTime(elapsed)}</p>
      )}

      {/* Visual animation */}
      {playing && (
        <div className="w-32 h-32 mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-breathe" />
          <div className="absolute inset-4 rounded-full bg-primary/15 animate-breathe" style={{ animationDelay: "0.5s" }} />
          <div className="absolute inset-8 rounded-full bg-primary/20 animate-breathe" style={{ animationDelay: "1s" }} />
        </div>
      )}

      <button
        onClick={() => { setPlaying(!playing); if (!playing) setElapsed(0); }}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>

      <p className="text-xs text-muted-foreground mt-4 text-center italic">
        Close your eyes. Let the sounds carry you somewhere calm.
      </p>
    </div>
  );
}
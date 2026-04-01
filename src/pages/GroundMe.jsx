import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const EXERCISES = [
  {
    id: "5-4-3-2-1",
    title: "5-4-3-2-1 Senses",
    desc: "Come back to the present through your senses",
    emoji: "🌿",
    steps: [
      { instruction: "Name 5 things you can SEE right now.", hint: "Look around slowly. What catches your eye?" },
      { instruction: "Name 4 things you can TOUCH.", hint: "Feel the textures around you." },
      { instruction: "Name 3 things you can HEAR.", hint: "Close your eyes. What sounds are there?" },
      { instruction: "Name 2 things you can SMELL.", hint: "Breathe in. What's in the air?" },
      { instruction: "Name 1 thing you can TASTE.", hint: "What's the taste in your mouth right now?" },
    ],
  },
  {
    id: "body-scan",
    title: "Quick Body Scan",
    desc: "Release tension from head to toe",
    emoji: "🧘",
    steps: [
      { instruction: "Unclench your jaw. Let it hang slightly open.", hint: "You didn't realize you were clenching, did you?" },
      { instruction: "Drop your shoulders. Away from your ears.", hint: "Let them fall as low as they'll go." },
      { instruction: "Unfold your arms. Open your palms.", hint: "Let your hands be soft and heavy." },
      { instruction: "Unclench your stomach. Let it be soft.", hint: "Release the muscles you've been holding." },
      { instruction: "Wiggle your toes. Feel the ground.", hint: "You are here. You are grounded." },
    ],
  },
  {
    id: "cold-water",
    title: "Cold Water Reset",
    desc: "Quick nervous system reset",
    emoji: "💧",
    steps: [
      { instruction: "Get cold water — a glass, a faucet, ice.", hint: "The colder the better." },
      { instruction: "Hold the cold water against your wrists for 30 seconds.", hint: "Feel the shock. Let it wake your senses." },
      { instruction: "Splash cold water on your face.", hint: "This activates your dive reflex — it slows your heart." },
      { instruction: "Take 3 slow breaths. In through nose, out through mouth.", hint: "Feel the shift happening in your body." },
    ],
  },
];

export default function GroundMe() {
  const [exercise, setExercise] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  if (!exercise) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="font-heading text-2xl font-bold mb-2">Ground Me</h1>
        <p className="text-muted-foreground text-sm mb-6">When everything feels like too much — start here.</p>
        <div className="space-y-3">
          {EXERCISES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => { setExercise(ex); setStepIndex(0); }}
              className="w-full p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ex.emoji}</span>
                <div>
                  <h3 className="font-semibold text-sm">{ex.title}</h3>
                  <p className="text-xs text-muted-foreground">{ex.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const step = exercise.steps[stepIndex];
  const isLast = stepIndex === exercise.steps.length - 1;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto flex flex-col min-h-[70vh]">
      <button onClick={() => setExercise(null)} className="self-start inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <p className="text-xs text-muted-foreground mb-1">{exercise.title}</p>
      <div className="flex gap-1.5 mb-8">
        {exercise.steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= stepIndex ? "bg-primary" : "bg-secondary"}`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <p className="text-5xl mb-4">{exercise.emoji}</p>
            <h2 className="font-heading text-xl font-semibold">{step.instruction}</h2>
            <p className="text-sm text-muted-foreground italic">{step.hint}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex gap-3">
        {stepIndex > 0 && (
          <Button variant="ghost" onClick={() => setStepIndex(stepIndex - 1)} className="flex-1">
            Back
          </Button>
        )}
        <Button
          onClick={() => isLast ? setExercise(null) : setStepIndex(stepIndex + 1)}
          className="flex-1 h-12"
        >
          {isLast ? "I feel more grounded 🌿" : "Next"}
        </Button>
      </div>
    </div>
  );
}
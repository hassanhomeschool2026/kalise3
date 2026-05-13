import { useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { id: "self_worth", label: "Self-Worth" },
  { id: "anxiety", label: "Anxiety Relief" },
  { id: "motivation", label: "Motivation" },
  { id: "healing", label: "Healing" },
  { id: "strength", label: "Inner Strength" },
  { id: "peace", label: "Peace" },
];

export default function Affirmations() {
  const [category, setCategory] = useState(null);
  const [affirmation, setAffirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const generateAffirmation = async (cat) => {
    setLoading(true);
    setCategory(cat);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Kalise — a warm, grounded, emotionally intelligent character. Generate ONE powerful spoken affirmation for the category: ${cat.label}.

Rules:
- Write it in first person ("I am...", "I choose...", "I allow...")
- Make it feel personal and specific, not generic
- Keep it 1-3 sentences
- It should feel like something a wise, caring friend would whisper to you
- Don't use quotes around it
- Just the affirmation text, nothing else`,
    });
    setAffirmation(res);
    setLoading(false);
  };

  const refresh = () => {
    if (category) generateAffirmation(category);
  };

  if (!category) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="font-heading text-2xl font-bold mb-2">Affirmations</h1>
        <p className="text-muted-foreground text-sm mb-6">Words you need to hear. Pick what resonates.</p>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => generateAffirmation(cat)}
              className="p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all text-center"
            >
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto flex flex-col items-center min-h-[70vh] justify-center">
      <button onClick={() => { setCategory(null); setAffirmation(""); }} className="self-start inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <p className="text-xs text-muted-foreground mb-6">{category.label}</p>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="w-8 h-8 rounded-full bg-primary/20 animate-breathe" />
          </motion.div>
        ) : (
          <motion.div
            key={affirmation}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center px-4"
          >
            <p className="font-heading text-xl font-semibold leading-relaxed mb-8">
              {affirmation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
        <Button variant="ghost" onClick={refresh} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Another one
        </Button>
      )}
    </div>
  );
}
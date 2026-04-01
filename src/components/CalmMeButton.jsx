import { useState } from "react";
import { Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";

const STATES = [
  { id: "panic", label: "Panic", emoji: "😰" },
  { id: "anger", label: "Anger", emoji: "😤" },
  { id: "anxiety", label: "Anxiety", emoji: "😟" },
  { id: "spiraling", label: "Spiraling", emoji: "🌀" },
  { id: "slow_down", label: "Slow Down", emoji: "🐢" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😵‍💫" },
];

const STATE_PROMPTS = {
  panic: "The user is in a state of PANIC. They need immediate grounding. Speak directly, calmly, and firmly. Guide them through a quick body scan — feet on floor, hands on something solid. Remind them they are safe. Use short sentences. Be warm but clear. You are Kalise — their calm, grounded friend.",
  anger: "The user is feeling ANGER. Validate it — anger is information. Don't tell them to calm down. Help them name what's underneath. Suggest a physical release: squeeze fists, stomp feet, press palms together hard for 10 seconds. Then breathe. You are Kalise — honest, caring, real.",
  anxiety: "The user is experiencing ANXIETY. Help them slow their nervous system. Guide them through box breathing (4-4-4-4). Remind them anxiety lies about the future. Bring them to this exact moment. What can they see, hear, touch right now? You are Kalise — gentle but grounded.",
  spiraling: "The user is SPIRALING. Interrupt the thought loop with a pattern break. Ask them to name 5 things they can see. Then 4 things they can touch. Keep instructions simple and direct. One thing at a time. You are Kalise — the friend who cuts through the noise with love.",
  slow_down: "The user needs to SLOW DOWN. They're moving too fast, doing too much. Give them permission to stop. Tell them nothing will fall apart if they take 5 minutes. Guide them through a body relaxation — shoulders down, jaw unclenched, hands open. You are Kalise — soft and reassuring.",
  overwhelmed: "The user is OVERWHELMED. Everything feels like too much. Validate that feeling. Then help them shrink their world to just this moment. What is one tiny thing they can do right now? Just one. Not the whole list. You are Kalise — practical, warm, no-nonsense.",
};

export default function CalmMeButton() {
  const [open, setOpen] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStateSelect = async (state) => {
    setSelectedState(state);
    setLoading(true);
    setResponse("");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `${STATE_PROMPTS[state.id]}\n\nRespond in 3-5 short paragraphs. Be immediate, specific, and personal. Start with acknowledging their state. No generic advice. End with something grounding they can do RIGHT NOW. Keep it under 200 words. Don't use bullet points — speak naturally like a real friend texting them.`,
    });
    setResponse(res);
    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSelectedState(null);
      setResponse("");
    }, 300);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 shadow-lg shadow-purple-500/30 flex items-center justify-center animate-pulse-soft hover:scale-110 transition-transform"
        aria-label="Calm Me"
      >
        <Heart className="w-7 h-7 text-white fill-white" />
      </button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-center">
              {selectedState ? `Let's work through this together` : `What's happening right now?`}
            </DialogTitle>
          </DialogHeader>

          {!selectedState ? (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {STATES.map((state) => (
                <button
                  key={state.id}
                  onClick={() => handleStateSelect(state)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all"
                >
                  <span className="text-2xl">{state.emoji}</span>
                  <span className="text-sm font-medium">{state.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-secondary rounded-lg">
                <span className="text-lg">{selectedState.emoji}</span>
                <span className="text-sm font-medium text-muted-foreground">{selectedState.label}</span>
              </div>
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-10 h-10 rounded-full bg-primary/20 animate-breathe" />
                  <p className="text-sm text-muted-foreground">Kalise is here...</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {response}
                </div>
              )}
              <button
                onClick={() => { setSelectedState(null); setResponse(""); }}
                className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Try a different one
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
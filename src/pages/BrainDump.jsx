import { useState } from "react";
import { ArrowLeft, Sparkles, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function BrainDump() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [followUps, setFollowUps] = useState(0);
  const [followUpInput, setFollowUpInput] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const handleDump = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Kalise — emotionally intelligent, warm, grounded, a little edgy. A user just did a brain dump. Analyze what they wrote and give back a structured but conversational response.

Brain dump:
"${text}"

Respond with this exact structure (use these headers):
## What's Going On
A brief, empathetic summary of what they're dealing with. 2-3 sentences max.

## What's Weighing on You Most
Identify the heaviest thing in their dump. Be specific. 1-2 sentences.

## A Reframe
Offer a different way to look at it. Not toxic positivity — real reframing. 2-3 sentences.

## One Thing You Can Do
One concrete, doable action they could take today. Make it small and specific.

Keep the whole response warm and conversational. No clinical language. Under 250 words total.`,
    });
    setAnalysis(res);
    await base44.entities.BrainDump.create({ raw_text: text, analysis: res, follow_ups_used: 0 });
    setLoading(false);
  };

  const handleFollowUp = async () => {
    if (!followUpInput.trim() || followUpLoading || followUps >= 3) return;
    setFollowUpLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Kalise. The user did a brain dump and you gave them this analysis:

Original dump: "${text}"
Your analysis: "${analysis}"

They have a follow-up question: "${followUpInput}"

Respond warmly and specifically in 2-4 sentences. Be Kalise — real, caring, no BS.`,
    });
    setAnalysis((prev) => prev + "\n\n---\n\n**You asked:** " + followUpInput + "\n\n" + res);
    setFollowUps((prev) => prev + 1);
    setFollowUpInput("");
    setFollowUpLoading(false);
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="font-heading text-2xl font-bold mb-2">Clear My Head</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Just dump everything out. Don't filter it. I'll help you make sense of it.
      </p>

      {!analysis ? (
        <div className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Just start typing. Whatever comes out, comes out..."
            className="min-h-[200px] text-sm leading-relaxed resize-none"
          />
          <Button
            onClick={handleDump}
            disabled={!text.trim() || loading}
            className="w-full h-12"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Kalise is reading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Clear My Head
              </span>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card border border-border/50 rounded-2xl p-5 prose prose-sm max-w-none">
            {analysis.split("\n").map((line, i) => {
              if (line.startsWith("## ")) {
                return <h3 key={i} className="font-heading text-base font-semibold text-primary mt-4 first:mt-0 mb-1">{line.replace("## ", "")}</h3>;
              }
              if (line === "---") {
                return <hr key={i} className="my-3 border-border" />;
              }
              if (line.startsWith("**")) {
                return <p key={i} className="font-medium text-foreground/90 text-sm">{line.replace(/\*\*/g, "")}</p>;
              }
              if (line.trim()) {
                return <p key={i} className="text-sm text-foreground/80 leading-relaxed">{line}</p>;
              }
              return null;
            })}
          </div>

          {/* Follow-ups */}
          {followUps < 3 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {3 - followUps} follow-up{3 - followUps !== 1 ? "s" : ""} remaining
              </p>
              <div className="flex gap-2">
                <input
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFollowUp()}
                  placeholder="Ask a follow-up..."
                  className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button size="icon" onClick={handleFollowUp} disabled={!followUpInput.trim() || followUpLoading} className="rounded-xl">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <Button variant="ghost" onClick={() => { setAnalysis(null); setText(""); setFollowUps(0); }} className="w-full">
            Start a new dump
          </Button>
        </div>
      )}
    </div>
  );
}
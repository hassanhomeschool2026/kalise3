import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import KaliseLogo from "../components/KaliseLogo";

const MODES = [
  { id: "listener", label: "Listener", emoji: "👂", desc: "I'll just hold space and listen" },
  { id: "supportive", label: "Supportive", emoji: "🤗", desc: "Gentle encouragement and validation" },
  { id: "real_talk", label: "Real Talk", emoji: "💬", desc: "Honest truth, delivered with love" },
];

const MODE_INSTRUCTIONS = {
  listener: "You are Kalise in LISTENER mode. Mostly reflect back what the user says. Ask gentle clarifying questions. Don't give advice unless asked. Make the user feel truly heard. Use warm, brief responses.",
  supportive: "You are Kalise in SUPPORTIVE mode. Validate their feelings. Offer gentle encouragement. Help them see their strengths. Be warm, uplifting, and caring. Not toxic positivity — real support.",
  real_talk: "You are Kalise in REAL TALK mode. Be honest and direct but always kind. Call out patterns you notice. Challenge gently when needed. You're the friend who tells the truth because you care too much to let them stay stuck.",
};

const CRISIS_KEYWORDS = ["kill myself", "suicide", "end it all", "want to die", "don't want to be here", "self harm", "hurt myself", "no reason to live"];

function detectCrisis(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

export default function TalkItOut() {
  const [mode, setMode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleModeSelect = (m) => {
    setMode(m);
    setMessages([{
      role: "assistant",
      content: m.id === "listener"
        ? "I'm here. Whatever's on your mind — just let it out. I'm listening. 💜"
        : m.id === "supportive"
        ? "Hey, I'm here for you. Whatever you're carrying, you don't have to carry it alone. What's going on? 💜"
        : "Alright, let's get real. What's going on with you? I'm not gonna sugarcoat it, but I've got you. 💜",
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setSending(true);

    // Crisis detection
    if (detectCrisis(userMsg)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Hey — I hear you, and I want you to know that what you're feeling matters. You matter. I'm here, but I also want to make sure you have the support you deserve right now.\n\n📞 **988 Suicide & Crisis Lifeline** — call or text **988** anytime, 24/7. You don't have to go through this alone.\n\nI'm still here too. Whatever you need. 💜",
        },
      ]);
      setSending(false);
      return;
    }

    const chatHistory = messages.map((m) => `${m.role === "user" ? "User" : "Kalise"}: ${m.content}`).join("\n");

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `${MODE_INSTRUCTIONS[mode.id]}

You are Kalise — a purple heart character who is calm, grounded, a little edgy, and deeply emotionally intelligent. You're like their most trusted friend. Keep responses conversational, warm, and under 150 words. Use natural language, not clinical speak. No bullet points. No "here are some tips." Just talk like a real friend.

Conversation so far:
${chatHistory}
User: ${userMsg}

Respond as Kalise:`,
    });

    setMessages((prev) => [...prev, { role: "assistant", content: res }]);
    setSending(false);
  };

  if (!mode) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="font-heading text-2xl font-bold mb-2">Talk It Out</h1>
        <p className="text-muted-foreground text-sm mb-6">How do you want me to show up for you right now?</p>
        <div className="space-y-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeSelect(m)}
              className="w-full p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-sm transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.emoji}</span>
                <div>
                  <h3 className="font-semibold">{m.label}</h3>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-lg mx-auto">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
        <button onClick={() => { setMode(null); setMessages([]); }} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <KaliseLogo size={28} />
        <div>
          <p className="text-sm font-semibold">Kalise</p>
          <p className="text-[10px] text-muted-foreground">{mode.emoji} {mode.label} mode</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary rounded-bl-md"
              }`}
            >
              {msg.content.split("\n").map((line, j) => (
                <p key={j} className={j > 0 ? "mt-2" : ""}>
                  {line.split("**").map((part, k) =>
                    k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                  )}
                </p>
              ))}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/50">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type what's on your mind..."
            className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="rounded-xl h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
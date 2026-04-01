import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Brain, Wind, Anchor, BookOpen, Sparkles, Music, Gamepad2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import KaliseLogo from "../components/KaliseLogo";
import FeatureCard from "../components/home/FeatureCard";

const FEATURES = [
  {
    to: "/talk",
    icon: MessageCircle,
    title: "Talk It Out",
    description: "Chat with Kalise about anything on your mind",
    gradient: "bg-gradient-to-br from-purple-400 to-purple-600",
  },
  {
    to: "/brain-dump",
    icon: Brain,
    title: "Clear My Head",
    description: "Dump it all out, get clarity back",
    gradient: "bg-gradient-to-br from-pink-400 to-rose-500",
  },
  {
    to: "/breathe",
    icon: Wind,
    title: "Guided Breathing",
    description: "Slow down with calming breath exercises",
    gradient: "bg-gradient-to-br from-sky-400 to-blue-500",
  },
  {
    to: "/ground",
    icon: Anchor,
    title: "Ground Me",
    description: "Exercises for anxiety, spiraling & overwhelm",
    gradient: "bg-gradient-to-br from-emerald-400 to-green-600",
  },
  {
    to: "/journal",
    icon: BookOpen,
    title: "My Journal",
    description: "Your private space to process & reflect",
    gradient: "bg-gradient-to-br from-amber-400 to-orange-500",
  },
  {
    to: "/affirmations",
    icon: Sparkles,
    title: "Affirmations",
    description: "Words you need to hear, by mood or subject",
    gradient: "bg-gradient-to-br from-violet-400 to-indigo-500",
  },
  {
    to: "/ambience",
    icon: Music,
    title: "Ambience",
    description: "Soothing soundscapes with therapeutic visuals",
    gradient: "bg-gradient-to-br from-teal-400 to-cyan-600",
  },
  {
    to: "/zen-games",
    icon: Gamepad2,
    title: "Zen Games",
    description: "Calming games to quiet your mind",
    gradient: "bg-gradient-to-br from-fuchsia-400 to-purple-500",
  },
];

const GREETINGS = [
  "How are you really doing today?",
  "Take a breath. You're here now.",
  "This is your space. No judgment.",
  "Ready to check in with yourself?",
  "Hey, I'm glad you're here.",
];

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);

  useEffect(() => {
    const loadProfile = async () => {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: me.email });
      if (profiles.length === 0) {
        navigate("/onboarding");
        return;
      }
      if (!profiles[0].subscribed) {
        navigate("/subscribe");
        return;
      }
      setProfile(profiles[0]);
      setLoading(false);
    };
    loadProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <KaliseLogo size={48} className="animate-breathe" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold mb-1">
          Hey, {profile?.nickname || "friend"} 💜
        </h1>
        <p className="text-muted-foreground text-sm">{greeting}</p>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.to} {...feature} />
        ))}
      </div>

      {/* Kalise quote */}
      <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center">
        <KaliseLogo size={28} className="mx-auto mb-2" />
        <p className="text-sm italic text-muted-foreground">
          "You don't have to have it all figured out. You just have to show up — and you did."
        </p>
        <p className="text-xs text-primary font-medium mt-1">— Kalise</p>
      </div>
    </div>
  );
}
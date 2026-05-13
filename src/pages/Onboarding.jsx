import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import KaliseAvatar from "../components/KaliseAvatar";

const AGE_GROUPS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];
const GENDERS = ["Woman", "Man", "Non-binary", "Genderfluid", "Prefer not to say", "Other"];
const PRONOUNS = ["she/her", "he/him", "they/them", "ze/zir", "prefer not to say", "other"];
const STRUGGLES = [
  "Anxiety", "Depression", "Stress", "Loneliness", "Overthinking",
  "Self-worth", "Grief", "Anger", "Burnout", "Relationships",
  "Sleep", "Motivation", "Focus", "Body image", "Life transitions",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    nickname: "",
    age_group: "",
    gender: "",
    pronouns: "",
    struggles: [],
  });
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    await base44.entities.UserProfile.create({
      ...data,
      onboarding_complete: true,
      subscribed: false,
    });
    setSaving(false);
    navigate("/subscribe");
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return data.nickname.trim().length > 0;
      case 2: return data.age_group !== "";
      case 3: return data.gender !== "";
      case 4: return data.pronouns !== "";
      case 5: return data.struggles.length > 0;
      default: return false;
    }
  };

  const toggleStruggle = (s) => {
    setData((prev) => ({
      ...prev,
      struggles: prev.struggles.includes(s)
        ? prev.struggles.filter((x) => x !== s)
        : [...prev.struggles, s],
    }));
  };

  const steps = [
    // Welcome
    <div className="flex flex-col items-center text-center gap-6" key="welcome">
      <KaliseAvatar expression="encouraging" size={88} animate={true} />
      <h1 className="font-heading text-3xl font-bold">Hey. I'm Kalise.</h1>
      <p className="text-muted-foreground leading-relaxed max-w-xs">
        Your space to breathe, vent, and figure it out. I'm not a therapist — I'm more like your most emotionally intelligent friend who tells you the truth with care.
      </p>
      <p className="text-muted-foreground text-sm">Let's get to know each other a little.</p>
    </div>,
    // Nickname
    <div className="flex flex-col gap-4" key="nickname">
      <h2 className="font-heading text-2xl font-semibold">What should I call you?</h2>
      <p className="text-muted-foreground text-sm">Your name, a nickname — whatever feels right.</p>
      <Input
        placeholder="Enter your name..."
        value={data.nickname}
        onChange={(e) => setData({ ...data, nickname: e.target.value })}
        className="text-lg h-12"
        autoFocus
      />
    </div>,
    // Age group
    <div className="flex flex-col gap-4" key="age">
      <h2 className="font-heading text-2xl font-semibold">How old are you?</h2>
      <p className="text-muted-foreground text-sm">This helps me talk to you in a way that fits.</p>
      <div className="grid grid-cols-2 gap-3">
        {AGE_GROUPS.map((ag) => (
          <button
            key={ag}
            onClick={() => setData({ ...data, age_group: ag })}
            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
              data.age_group === ag
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary hover:bg-secondary/80 border-transparent"
            }`}
          >
            {ag}
          </button>
        ))}
      </div>
    </div>,
    // Gender
    <div className="flex flex-col gap-4" key="gender">
      <h2 className="font-heading text-2xl font-semibold">How do you identify?</h2>
      <div className="grid grid-cols-2 gap-3">
        {GENDERS.map((g) => (
          <button
            key={g}
            onClick={() => setData({ ...data, gender: g })}
            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
              data.gender === g
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary hover:bg-secondary/80 border-transparent"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>,
    // Pronouns
    <div className="flex flex-col gap-4" key="pronouns">
      <h2 className="font-heading text-2xl font-semibold">What are your pronouns?</h2>
      <div className="grid grid-cols-2 gap-3">
        {PRONOUNS.map((p) => (
          <button
            key={p}
            onClick={() => setData({ ...data, pronouns: p })}
            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
              data.pronouns === p
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary hover:bg-secondary/80 border-transparent"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>,
    // Struggles
    <div className="flex flex-col gap-4" key="struggles">
      <h2 className="font-heading text-2xl font-semibold">What weighs on you most?</h2>
      <p className="text-muted-foreground text-sm">Pick as many as feel true. No judgment here.</p>
      <div className="flex flex-wrap gap-2">
        {STRUGGLES.map((s) => (
          <button
            key={s}
            onClick={() => toggleStruggle(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.struggles.includes(s)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="px-4 pt-4">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Privacy notice */}
      {step === 0 && (
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>Your data is securely stored and never sold. Ever.</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="px-6 pb-8 flex gap-3">
        {step > 0 && (
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            className="flex-1"
          >
            Back
          </Button>
        )}
        <Button
          onClick={() => {
            if (step < steps.length - 1) setStep(step + 1);
            else handleFinish();
          }}
          disabled={!canProceed() || saving}
          className="flex-1 h-12 text-base bg-primary hover:bg-primary/90"
        >
          {saving ? "Saving..." : step === steps.length - 1 ? "Let's go" : "Continue"}
          {!saving && <ChevronRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}
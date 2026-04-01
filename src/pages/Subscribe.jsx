import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import KaliseLogo from "../components/KaliseLogo";

const FEATURES = [
  "Unlimited conversations with Kalise",
  "Brain dump analysis & reframes",
  "Guided breathing & grounding",
  "Private journal with 45-day history",
  "Ambient soundscapes & zen games",
  "Spoken affirmations by mood",
  "Instant Calm Me panic support",
];

export default function Subscribe() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    // In production, this would integrate with a payment provider
    // For now, we mark the user as subscribed
    const profiles = await base44.entities.UserProfile.filter({ created_by: (await base44.auth.me()).email });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, { subscribed: true });
    }
    setLoading(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      <KaliseLogo size={60} className="mb-6 animate-float" />
      
      <h1 className="font-heading text-3xl font-bold text-center mb-2">
        You're almost in
      </h1>
      <p className="text-muted-foreground text-center mb-8 max-w-xs">
        Subscribe to unlock everything Kalise has to offer. Your mental wellness toolkit, always in your pocket.
      </p>

      {/* Plan card */}
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
          <Star className="w-3 h-3" /> Most Popular
        </div>
        
        <h3 className="font-heading text-lg font-semibold mb-1">Kalise Premium</h3>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-bold">$9.99</span>
          <span className="text-muted-foreground text-sm">/month</span>
        </div>

        <div className="space-y-3 mb-6">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full h-12 text-base bg-primary hover:bg-primary/90"
        >
          {loading ? "Setting up..." : "Start Your Journey"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Cancel anytime. No questions asked. Your data stays yours.
      </p>
    </div>
  );
}
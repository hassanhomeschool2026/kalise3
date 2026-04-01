import { useState, useEffect } from "react";
import { ArrowLeft, LogOut, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import KaliseLogo from "../components/KaliseLogo";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const profiles = await base44.entities.UserProfile.filter({ created_by: me.email });
      if (profiles.length > 0) setProfile(profiles[0]);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <KaliseLogo size={40} />
        </div>
        <h1 className="font-heading text-2xl font-bold">{profile?.nickname || user?.full_name || "Friend"}</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      {profile && (
        <div className="space-y-3 mb-8">
          <div className="p-4 rounded-2xl bg-card border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">About you</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Age: </span>
                <span>{profile.age_group}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pronouns: </span>
                <span>{profile.pronouns}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Gender: </span>
                <span>{profile.gender}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status: </span>
                <span className={profile.subscribed ? "text-green-600" : "text-muted-foreground"}>
                  {profile.subscribed ? "Premium" : "Free"}
                </span>
              </div>
            </div>
          </div>

          {profile.struggles?.length > 0 && (
            <div className="p-4 rounded-2xl bg-card border border-border/50">
              <p className="text-xs text-muted-foreground mb-2">What you're working through</p>
              <div className="flex flex-wrap gap-2">
                {profile.struggles.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-secondary rounded-xl">
          <Shield className="w-4 h-4" />
          <span>Your data is encrypted and never sold. It's yours.</span>
        </div>

        <Button
          variant="ghost"
          onClick={() => base44.auth.logout()}
          className="w-full text-muted-foreground hover:text-destructive gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
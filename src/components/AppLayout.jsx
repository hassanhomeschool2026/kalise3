import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, BookOpen, User } from "lucide-react";
import CalmMeButton from "./CalmMeButton";
import KaliseAvatar from "./KaliseAvatar";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/talk", icon: MessageCircle, label: "Talk" },
  { path: "/journal", icon: BookOpen, label: "Journal" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <KaliseAvatar expression="calm" size={32} />
          <span className="font-heading text-lg font-semibold text-foreground">Kalise</span>
        </Link>
        <p className="text-xs text-muted-foreground italic hidden sm:block">Your space to breathe</p>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Calm Me Button */}
      <CalmMeButton />

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/50 px-2 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
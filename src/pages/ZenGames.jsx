import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import BubblePop from "./zen-games/BubblePop";
import PondRipple from "./zen-games/PondRipple";
import SandGarden from "./zen-games/SandGarden";

const GAMES = [
  { id: "bubble", name: "Bubble Pop", emoji: "🫧", desc: "Pop floating bubbles", component: BubblePop },
  { id: "pond", name: "Pond Ripple", emoji: "💧", desc: "Create peaceful ripples", component: PondRipple },
  { id: "sand", name: "Sand Garden", emoji: "🏖️", desc: "Draw patterns in sand", component: SandGarden },
];

export default function ZenGames() {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame) {
    const GameComponent = activeGame.component;
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <button onClick={() => setActiveGame(null)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="font-heading text-lg font-semibold mb-3">{activeGame.emoji} {activeGame.name}</h2>
        <div className="w-full rounded-2xl overflow-hidden" style={{ height: "60vh" }}>
          <GameComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="font-heading text-2xl font-bold mb-2">Zen Games</h1>
      <p className="text-muted-foreground text-sm mb-6">Simple games to quiet your mind.</p>
      <div className="space-y-3">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game)}
            className="w-full p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{game.emoji}</span>
              <div>
                <h3 className="font-semibold text-sm">{game.name}</h3>
                <p className="text-xs text-muted-foreground">{game.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
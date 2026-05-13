import { motion } from "framer-motion";

/**
 * KaliseAvatar - Abstract, soft, glowing visual identity for Kalise.
 *
 * Props:
 *   expression: "calm" | "supportive" | "encouraging" (default: "calm")
 *   size: number (default: 80)
 *   animate: boolean - enables breathing/glowing animation (default: false)
 *   className: string
 */
export default function KaliseAvatar({ expression = "calm", size = 80, animate = false, className = "" }) {
  // Color palettes per expression
  const palettes = {
    calm: {
      outer: ["#C4B5FD", "#8B5CF6", "#6D28D9"],
      mid: ["#DDD6FE", "#A78BFA", "#7C3AED"],
      glow: "#A78BFA",
      eye: "#EDE9FE",
      mouth: "#DDD6FE",
    },
    supportive: {
      outer: ["#FBCFE8", "#EC4899", "#BE185D"],
      mid: ["#FCE7F3", "#F9A8D4", "#F472B6"],
      glow: "#F9A8D4",
      eye: "#FDF2F8",
      mouth: "#FBCFE8",
    },
    encouraging: {
      outer: ["#FDE68A", "#F59E0B", "#D97706"],
      mid: ["#FEF3C7", "#FCD34D", "#FBBF24"],
      glow: "#FCD34D",
      eye: "#FFFBEB",
      mouth: "#FDE68A",
    },
  };

  const p = palettes[expression] || palettes.calm;

  // Mouth shape per expression
  const mouths = {
    calm: "M 28 38 Q 32 42 36 38",
    supportive: "M 26 37 Q 32 44 38 37",
    encouraging: "M 25 36 Q 32 46 39 36",
  };

  const gradId = `kalise-grad-${expression}`;
  const glowId = `kalise-glow-${expression}`;

  return (
    <motion.div
      className={`inline-flex items-center justify-center relative ${className}`}
      style={{ width: size, height: size }}
      animate={animate ? { scale: [1, 1.06, 1] } : {}}
      transition={animate ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
    >
      {/* Outer glow ring */}
      {animate && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size * 1.35,
            height: size * 1.35,
            background: `radial-gradient(circle, ${p.glow}44 0%, transparent 70%)`,
          }}
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
      >
        <defs>
          <radialGradient id={gradId} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor={p.mid[0]} />
            <stop offset="50%" stopColor={p.mid[1]} />
            <stop offset="100%" stopColor={p.outer[2]} />
          </radialGradient>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main orb body */}
        <circle
          cx="32"
          cy="32"
          r="26"
          fill={`url(#${gradId})`}
          filter={`url(#${glowId})`}
          opacity="0.95"
        />

        {/* Subtle inner highlight */}
        <ellipse cx="26" cy="24" rx="9" ry="6" fill="white" opacity="0.18" />

        {/* Left eye */}
        <ellipse cx="24" cy="28" rx="2.5" ry="3" fill={p.eye} opacity="0.9" />
        <ellipse cx="24.8" cy="27.2" rx="0.9" ry="1.1" fill="white" opacity="0.6" />

        {/* Right eye */}
        <ellipse cx="40" cy="28" rx="2.5" ry="3" fill={p.eye} opacity="0.9" />
        <ellipse cx="40.8" cy="27.2" rx="0.9" ry="1.1" fill="white" opacity="0.6" />

        {/* Mouth */}
        <path
          d={mouths[expression] || mouths.calm}
          stroke={p.mouth}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </svg>
    </motion.div>
  );
}
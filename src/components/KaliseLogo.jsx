export default function KaliseLogo({ size = 48, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      {/* Heart shape that doubles as speech bubble */}
      <path
        d="M32 56C32 56 8 40 8 22C8 14 14 8 22 8C26.4 8 30.4 10.4 32 14C33.6 10.4 37.6 8 42 8C50 8 56 14 56 22C56 40 32 56 32 56Z"
        fill="url(#kalise-gradient)"
        stroke="none"
      />
      {/* Speech bubble tail */}
      <path
        d="M14 38C10 42 8 48 10 50C12 52 16 48 18 44"
        fill="url(#kalise-gradient)"
        stroke="none"
      />
      {/* Eyes */}
      <ellipse cx="24" cy="24" rx="2.5" ry="3" fill="white" opacity="0.9" />
      <ellipse cx="40" cy="24" rx="2.5" ry="3" fill="white" opacity="0.9" />
      {/* Gentle smile */}
      <path
        d="M26 32C28 35 36 35 38 32"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <defs>
        <linearGradient id="kalise-gradient" x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}
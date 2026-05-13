import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot } from "recharts";
import moment from "moment";

const MOOD_SCORES = { great: 5, good: 4, okay: 3, low: 2, rough: 1 };
const MOOD_LABELS = { 5: "Great 😊", 4: "Good 🙂", 3: "Okay 😐", 2: "Low 😔", 1: "Rough 😢" };
const MOOD_COLORS = { 5: "#8B5CF6", 4: "#A78BFA", 3: "#94A3B8", 2: "#F59E0B", 1: "#EF4444" };

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  if (!payload.score) return null;
  return <circle cx={cx} cy={cy} r={5} fill={MOOD_COLORS[payload.score]} stroke="white" strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length || !payload[0].payload.score) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold">{MOOD_LABELS[d.score]}</p>
      <p className="text-muted-foreground">{d.fullDate}</p>
    </div>
  );
};

export default function MoodChart({ entries }) {
  const data = useMemo(() => {
    // Build last 30 days
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const day = moment().subtract(i, "days");
      const dayEntries = entries.filter((e) =>
        moment(e.created_date).isSame(day, "day") && e.mood
      );
      // Use the most recent mood for that day
      const latest = dayEntries[0];
      days.push({
        date: day.format("M/D"),
        fullDate: day.format("MMMM D"),
        score: latest ? MOOD_SCORES[latest.mood] : null,
      });
    }
    return days;
  }, [entries]);

  const moodedEntries = entries.filter((e) => e.mood);
  if (moodedEntries.length < 2) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-5 mb-6 text-center">
        <p className="text-2xl mb-2">📈</p>
        <p className="text-sm font-medium">Your Mood Journey</p>
        <p className="text-xs text-muted-foreground mt-1">Log at least 2 journal entries with a mood to see your pattern.</p>
      </div>
    );
  }

  // Calculate average mood
  const scores = moodedEntries.map((e) => MOOD_SCORES[e.mood]).filter(Boolean);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const avgLabel = Object.entries(MOOD_LABELS).find(([score]) => Math.round(avg) === Number(score))?.[1] || "";

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 mb-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold">Your Mood Journey</h2>
        <span className="text-xs text-muted-foreground">Last 30 days</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Overall average: <span className="text-foreground font-medium">{avgLabel}</span>
      </p>

      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            interval={6}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 6 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-between mt-3">
        {Object.entries(MOOD_COLORS).reverse().map(([score, color]) => (
          <div key={score} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[9px] text-muted-foreground">{["Rough","Low","Okay","Good","Great"][score - 1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
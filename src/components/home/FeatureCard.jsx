import { Link } from "react-router-dom";

export default function FeatureCard({ to, icon: Icon, title, description, gradient }) {
  return (
    <Link
      to={to}
      className="block p-4 rounded-2xl border border-border/50 bg-card hover:shadow-md hover:border-primary/20 transition-all group"
    >
      <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-heading text-base font-semibold mb-0.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </Link>
  );
}
import { cn } from "@/lib/utils";

interface Props {
  percent: number;
  size?: "sm" | "md";
  className?: string;
}

export default function ProgressRing({ percent, size = "md", className }: Props) {
  const dims = size === "sm" ? { r: 16, stroke: 3, box: 40 } : { r: 22, stroke: 3.5, box: 56 };
  const circ = 2 * Math.PI * dims.r;
  const offset = circ - (percent / 100) * circ;

  const color =
    percent >= 80 ? "#4ade80" : percent >= 50 ? "#fbbf24" : percent >= 20 ? "#f97316" : "#ef4444";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={dims.box} height={dims.box} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={dims.box / 2} cy={dims.box / 2} r={dims.r}
          fill="none" stroke="#e5e0d8" strokeWidth={dims.stroke}
        />
        {/* Progress ring */}
        <circle
          cx={dims.box / 2} cy={dims.box / 2} r={dims.r}
          fill="none" stroke={color} strokeWidth={dims.stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-warm-brown">
        {percent}%
      </span>
    </div>
  );
}

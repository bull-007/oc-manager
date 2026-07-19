import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  watercolor?: "amber" | "rose" | "sage" | "mixed";
  decorated?: boolean;
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const watercolorStyles: Record<string, string> = {
  amber: "watercolor-amber",
  rose: "watercolor-rose",
  sage: "watercolor-sage",
  mixed: "watercolor-mixed",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, padding = "md", watercolor, decorated, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-warm-paper border border-warm-border rounded-xl shadow-sm",
          "transition-all duration-300",
          hover &&
            "hover:shadow-lg hover:-translate-y-1 hover:border-amber-300 cursor-pointer",
          watercolor && watercolorStyles[watercolor],
          decorated && "corners-floral",
          paddings[padding],
          className
        )}
        style={watercolor || decorated ? {
          borderRadius: "20px 6px 20px 6px / 18px 5px 18px 5px",
        } : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;

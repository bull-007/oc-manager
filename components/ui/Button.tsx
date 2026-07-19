import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary:
    "bg-amber-700 text-warm-cream hover:bg-amber-800 border-amber-700",
  secondary:
    "bg-warm-paper text-warm-brown border-warm-border hover:bg-warm-bg",
  ghost:
    "bg-transparent text-warm-brown hover:bg-warm-bg border-transparent",
  danger:
    "bg-red-500 text-white hover:bg-red-600 border-red-500",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3 text-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md",
          variants[variant],
          sizes[size],
          className
        )}
        style={{ borderRadius: "16px 5px 16px 5px / 14px 4px 14px 4px" }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "text-white border-transparent",
  secondary: "bg-stone-card text-stone-text border-stone-border hover:bg-stone-hover",
  ghost: "bg-transparent text-stone-text hover:bg-stone-hover border-transparent",
  danger: "bg-red-500 text-white hover:bg-red-600 border-red-500",
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
          "inline-flex items-center justify-center gap-2 border font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md",
          variants[variant],
          sizes[size],
          className
        )}
        style={variant === "primary" ? { background: "#869087", borderRadius: "8px" } : { borderRadius: "8px" }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

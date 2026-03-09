import React from "react";
import * as Icons from "./icons/icons";

// Simple utility to combine class names
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "destructive" | "accent";
  size?: "sm" | "md";
}

const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ className, variant = "primary", size = "md", "aria-label": ariaLabel = "Cerrar", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-full cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";

    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground group",
      destructive: "bg-destructive hover:bg-destructive/80 group",
      accent: "bg-accent hover:bg-secondary",
    };

    const sizes = {
      sm: "h-6 w-6",
      md: "h-8 w-8",
    };

    const iconSizes = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
    };

    const iconColors = {
      primary: "fill-background group-hover:fill-secondary-foreground",
      destructive: "fill-input group-hover:fill-secondary/80",
      accent: "fill-accent-foreground",
    };

    return (
      <button ref={ref} className={cn(baseClasses, variants[variant], sizes[size], className)} aria-label={ariaLabel} {...props}>
        <Icons.Close className={cn(iconSizes[size], iconColors[variant])} />
      </button>
    );
  },
);

CloseButton.displayName = "CloseButton";

export { CloseButton };

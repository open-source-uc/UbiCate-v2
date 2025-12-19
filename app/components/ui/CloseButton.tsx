import React from "react";

import * as Icons from "@/app/components/ui/icons/icons";

// Simple utility to combine class names
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "destructive";
  size?: "sm" | "md";
}

const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ className, variant = "primary", size = "md", "aria-label": ariaLabel = "Cerrar", ...props }, ref) => {
    const baseClasses =
      "flex items-center justify-center rounded-full cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group";

    const variants = {
      primary: "bg-primary hover:bg-secondary",
      accent: "bg-accent hover:bg-secondary",
      destructive: "bg-destructive hover:bg-destructive/80",
    };

    const sizes = {
      sm: "p-1",
      md: "w-8 h-8",
    };

    const iconColors = {
      primary: "fill-background group-hover:fill-secondary-foreground",
      accent: "fill-foreground group-hover:fill-secondary-foreground",
      destructive: "fill-input group-hover:fill-secondary/80",
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        aria-label={ariaLabel}
        {...props}
      >
        <Icons.Close className={cn("w-4 h-4", iconColors[variant])} />
      </button>
    );
  },
);

CloseButton.displayName = "CloseButton";

export { CloseButton };

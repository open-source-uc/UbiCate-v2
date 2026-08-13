import React from "react";

// Simple utility to combine class names
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "accent"
    | "secondary"
    | "destructive"
    | "ghost"
    | "ghost-primary"
    | "mapPrimary"
    | "mapSecondary"
    | "mapAccent";
  size?: "sm" | "md" | "lg" | "icon" | "icon-lg" | "sidebar" | "sidebar-collapsed";
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  text?: string;
  isActive?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      icon,
      badge,
      text,
      isActive = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isSidebarSize = size === "sidebar" || size === "sidebar-collapsed";

    const baseClasses = cn(
      "inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ring-offset-background pointer-events-auto cursor-pointer",
      // Las pestañas del sidebar ya marcan su estado con `isActive`; el ring de foco se veía como un
      // borde suelto alrededor del botón completo.
      isSidebarSize
        ? "outline-none focus:outline-none focus-visible:outline-none"
        : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    );

    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      accent: "bg-accent text-accent-foreground hover:bg-accent/80",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      ghost: "hover:border-primary",
      "ghost-primary": "hover:border-primary text-primary",
      mapPrimary: cn(
        "bg-primary text-primary-foreground border border-transparent",
        "hover:border-primary/60 hover:bg-accent",
      ),
      mapSecondary: cn(
        "bg-secondary text-foreground border border-transparent",
        "hover:border-primary/40 hover:bg-accent",
      ),
      mapAccent: cn("bg-accent text-accent-foreground border border-transparent", "hover:bg-accent/80"),
    };

    const sizes = {
      sm: "h-9 px-3 rounded-md text-sm",
      md: "h-10 py-2 px-4 rounded-md text-sm",
      lg: "h-11 px-8 rounded-md text-base",
      icon: "h-10 w-10 rounded-md",
      "icon-lg": "h-12 w-12 rounded-md",
      sidebar: "w-full p-2 rounded-md space-x-4 justify-start transition-all duration-200",
      "sidebar-collapsed": "justify-center px-4 py-3 transition-all duration-200",
    };

    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
      icon: "w-5 h-5",
      "icon-lg": "w-7 h-7",
      sidebar: "w-10 h-10",
      "sidebar-collapsed": "w-10 h-10",
    };

    const iconColors = {
      primary: "[&_svg]:fill-primary-foreground [&_svg]:stroke-primary-foreground",
      accent: "[&_svg]:fill-accent-foreground [&_svg]:stroke-accent-foreground",
      secondary: "[&_svg]:fill-secondary-foreground [&_svg]:stroke-secondary-foreground",
      destructive: "[&_svg]:fill-destructive-foreground [&_svg]:stroke-destructive-foreground",
      ghost: "[&_svg]:fill-background [&_svg]:stroke-background",
      "ghost-primary": "[&_svg]:fill-primary [&_svg]:stroke-primary",
      mapPrimary: "[&_svg]:fill-primary-foreground [&_svg]:stroke-primary-foreground",
      mapSecondary: "[&_svg]:fill-foreground [&_svg]:stroke-foreground",
      mapAccent: "[&_svg]:fill-accent-foreground [&_svg]:stroke-accent-foreground",
    } as const;

    const getIconWrapperClass = () => {
      if (isSidebarSize) {
        // shrink-0: sin esto flexbox achica el ícono mientras el sidebar todavía está angosto y se ve
        // como si el ícono "creciera" al terminar la animación.
        return cn(
          iconSizes[size],
          "shrink-0 rounded-lg flex items-center justify-center",
          isActive ? "bg-secondary" : "bg-primary",
          iconColors[variant],
        );
      }
      return cn(iconSizes[size], iconColors[variant]);
    };

    const content = () => {
      if (children) return children;

      if (isSidebarSize) {
        return (
          <>
            {icon ? (
              <span className={cn(getIconWrapperClass(), "relative")}>
                <div className="w-6 h-6 shrink-0 flex items-center justify-center">{icon}</div>
                {badge ? (
                  <span className="pointer-events-none absolute left-1/2 -top-1 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-secondary-foreground shadow-sm">
                    {badge}
                  </span>
                ) : null}
              </span>
            ) : null}
            {text && size === "sidebar" ? (
              <span className="anim-fade-in text-md block whitespace-nowrap">{text}</span>
            ) : null}
          </>
        );
      }

      return (
        <>
          {icon ? (
            <span className={cn(iconSizes[size], iconColors[variant])}>
              <div className={cn("flex items-center justify-center", iconSizes[size])}>{icon}</div>
            </span>
          ) : null}
          {text ? <span>{text}</span> : null}
        </>
      );
    };

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {content()}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };

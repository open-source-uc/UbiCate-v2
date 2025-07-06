import { ReactNode } from "react";

interface ActionButtonProps {
  onClick: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  ariaLabel: string;
  icon: ReactNode;
  label: string;
  className?: string;
  variant?: "primary" | "secondary";
}

export default function ActionButton({
  onClick,
  onKeyDown,
  ariaLabel,
  icon,
  label,
  className = "",
  variant = "secondary",
}: ActionButtonProps) {
  const baseClasses =
    "flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95";
  
  const variantClasses = {
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
    secondary: "bg-background hover:bg-accent/10 text-foreground",
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      role="button"
      tabIndex={0}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      <div className="w-8 h-8 mb-2 flex items-center justify-center">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

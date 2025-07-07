import { ReactNode } from "react";

interface MobileNavigationButtonProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function MobileNavigationButton({
  icon,
  label,
  isActive,
  onClick,
  disabled = false,
  className = "",
}: MobileNavigationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex flex-col items-center justify-center p-2 rounded-md transition hover:bg-accent/18 ${
        isActive ? "bg-primary" : "bg-transparent"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      aria-pressed={isActive}
      aria-disabled={disabled}
    >
      <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">{icon}</span>
      <p className="text-sm tablet:text-md mt-1">{label}</p>
    </button>
  );
}

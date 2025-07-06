import { ReactNode } from "react";

interface DesktopNavigationButtonProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function DesktopNavigationButton({
  icon,
  label,
  isActive,
  isExpanded,
  onClick,
  disabled = false,
  className = "",
}: DesktopNavigationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${isExpanded ? "w-full p-2 rounded-md" : ""} ${
        !disabled && isExpanded ? "hover:bg-muted" : ""
      } flex items-center pointer-events-auto ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${
        !isExpanded ? "justify-center px-4 py-3" : "space-x-4"
      } ${className}`}
    >
      <span
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          disabled ? "bg-muted text-muted-foreground" : isActive ? "bg-primary" : "bg-accent"
        }`}
      >
        {icon}
      </span>
      <span className={`text-md ${isExpanded ? "block" : "hidden"} ${disabled ? "text-muted-foreground" : ""}`}>
        {label}
      </span>
    </button>
  );
}

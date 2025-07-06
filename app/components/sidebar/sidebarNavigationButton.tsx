import { ReactNode } from "react";

interface SidebarNavigationButtonProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function SidebarNavigationButton({
  icon,
  label,
  isActive,
  isExpanded,
  onClick,
  disabled = false,
  className = "",
}: SidebarNavigationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${
        isExpanded ? "w-full p-2 rounded-md hover:bg-accent/18" : ""
      } flex items-center pointer-events-auto cursor-pointer ${
        !isExpanded ? "justify-center px-4 py-3" : "space-x-4"
      } ${disabled ? "opacity-50" : ""} ${className}`}
    >
      <span
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isActive ? "bg-primary" : "bg-accent"
        }`}
      >
        {icon}
      </span>
      <span className={`text-md ${isExpanded ? "block" : "hidden"}`}>{label}</span>
    </button>
  );
}

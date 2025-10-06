import React, { ReactNode } from "react";

interface PillProps {
  title: string;
  icon: ReactNode;
  bg_color: string;
  active: boolean;
  onClick: () => void;
  activateClassName?: string;
  noActivateClassName?: string;
  className?: string;
}

function Pill({
  title,
  onClick,
  active,
  bg_color,
  activateClassName = "bg-primary",
  noActivateClassName = "bg-background desktop:bg-secondary text-foreground",
  className = "w-full rounded-lg flex items-center px-2 py-1.5 border-1 border-border desktop:border-transparent",
  icon,
}: PillProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`${className} 
        ${active ? activateClassName : noActivateClassName}
        pointer-events-auto cursor-pointer transition-colors duration-200
        group hover:bg-secondary`}
    >
      <div
        className={`flex items-center justify-center
        min-w-[24px] min-h-[24px] desktop:min-w-[28px] desktop:min-h-[28px]`}
      >
        <div className={`${bg_color} w-8 h-8 rounded-sm flex justify-center items-center`}>{icon}</div>
      </div>
      <span className="px-2 whitespace-nowrap text-xs font-medium group-hover:text-secondary-foreground desktop:text-sm">{title}</span>
    </button>
  );
}

export default Pill;

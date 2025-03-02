import React from "react";

interface PillProps {
  title: string;
  iconGoogle: string;
  bg_color: string;
  active: boolean;
  onClick: () => void;
  activateClassName?: string;
  noActivateClassName?: string;
}

function Pill({ title, iconGoogle, onClick, active, bg_color,
  activateClassName = "bg-blue-location",
  noActivateClassName = "bg-brown-dark desktop:bg-brown-medium text-white-ubi" }: PillProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`rounded-xl w-full flex items-center px-2 py-1.5 border-1 border-brown-medium desktop:border-transparent
        ${active ? activateClassName : noActivateClassName} 
        pointer-events-auto cursor-pointer transition-colors duration-200
        hover:bg-brown-light`}
    >
      <div
        className={`flex items-center justify-center rounded-lg ${bg_color} 
        min-w-[24px] min-h-[24px] desktop:min-w-[28px] desktop:min-h-[28px]`}
      >
        <span className="material-symbols-outlined text-sm desktop:text-base p-0.5">{iconGoogle}</span>
      </div>
      <span className="px-2 whitespace-nowrap text-xs font-medium desktop:text-sm desktop:font-normal">{title}</span>
    </button>
  );
}

export default Pill;

import React from "react";
import IconSelector from "./icons/icons";
import { IconName } from "@/utils/types";

interface PillProps {
  title: string;
  iconGoogle: IconName;
  bg_color: string;
  active: boolean;
  onClick: () => void;
  activateClassName?: string;
  noActivateClassName?: string;
}

function Pill({
  title,
  iconGoogle,
  onClick,
  active,
  bg_color,
  activateClassName = "bg-blue-location",
  noActivateClassName = "bg-brown-dark desktop:bg-brown-medium text-white-ubi",
}: PillProps) {
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
        className={`flex items-center justify-center rounded-lg
        min-w-[24px] min-h-[24px] desktop:min-w-[28px] desktop:min-h-[28px]`}
      >
        <div className={`${bg_color} w-8 h-8 rounded-md flex justify-center items-center`}>
          <IconSelector iconName={iconGoogle} className={`w-7 h-7`}></IconSelector>
        </div>
      </div>
      <span className="px-2 whitespace-nowrap text-xs font-medium desktop:text-sm desktop:font-normal">{title}</span>
    </button>
  );
}

export default Pill;

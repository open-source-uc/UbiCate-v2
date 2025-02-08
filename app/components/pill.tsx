import React from "react";

interface PillProps {
  title: string;
  iconGoogle: string;
  bg_color: string;
  active: boolean;
  onClick: () => void;
}

function Pill({ title, iconGoogle, onClick, active, bg_color }: PillProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="rounded-lg w-full flex justify-left items-center px-2 py-1 bg-brown-medium text-white-ubi pointer-events-auto cursor-pointer text-md"
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bg_color}`}>
        <span className="material-symbols-outlined">{iconGoogle}</span>
      </div>
      <span className="px-2 whitespace-nowrap">{title}</span>
    </button>
  );
}

export default Pill;

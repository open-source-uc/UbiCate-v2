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
      className="rounded-xl w-full flex justify-left items-center px-2 py-1 bg-brown-dark desktop:bg-brown-medium text-white-ubi pointer-events-auto cursor-pointer text-md hover:bg-brown-light"
    >
      <div className={`flex items-center justify-center rounded-lg desktop:rounded-full ${bg_color}`}>
        <span className="material-symbols-outlined p-0.5 desktop:p-1">{iconGoogle}</span>
      </div>
      <span className="px-2 whitespace-nowrap text-sm font-light desktop:text-md desktop:font-normal">{title}</span>
    </button>
  );
}

export default Pill;

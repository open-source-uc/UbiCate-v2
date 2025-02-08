import Image from "next/image";

import React from "react";

interface PillProps {
  title: string;
  iconGoogle: string;
  active: boolean;
  onClick: () => void;
}

function Pill({ title, iconGoogle, onClick, active }: PillProps) {
  return (
    <button onClick={onClick} type="button" className="rounded-lg w-full flex justify-center items-center font-semibold bg-brown-medium text-white-ubi pointer-events-auto cursor-pointer min-h-[36px] max-h-[36px]">
        <span className="material-symbols-outlined">{iconGoogle}</span>
        <span className="px-2 whitespace-nowrap">{title}</span>
    </button>
  );
}

export default Pill;

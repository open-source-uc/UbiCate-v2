import Image from "next/image";

import React from "react";

interface PillProps {
  title: string;
  iconPath: string;
  active: boolean;
  onClick: () => void;
}

function Pill({ title, iconPath, onClick, active }: PillProps) {
  return (
    <button onClick={onClick} type="button">
      <section
        className={`
          ${active ? "bg-brown-light text-white-ubi transition-transform duration-300" : "bg-brown-medium"}
          pointer-events-auto cursor-pointer
          min-h-[36px] max-h-[36px] rounded-lg
          flex justify-center items-center font-semibold px-2 min-w-5
          transition-colors duration-300 ease-in-out
        `}
      >
        <span className="px-2 whitespace-nowrap">{title}</span>
        <div>
          <Image
            className={`
              pe-2 max-map-sm:pe-0 
              w-3 h-3 min-w-[24px] min-h-[24px]
            `}
            src={iconPath}
            alt="icon"
            width={16}
            height={16}
          />
        </div>
      </section>
    </button>
  );
}

export default Pill;

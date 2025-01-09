import { Inter } from "next/font/google";
import Image from "next/image";

import React from "react";

interface PillProps {
  title: string;
  iconPath: string;
  active: boolean;
  onClick: () => void;
}

const inter = Inter({ subsets: ["latin"] });

function Pill({ title, iconPath, onClick, active }: PillProps) {
  return (
    <button onClick={onClick} type="button">
      <section
        className={`
          ${active ? "bg-sky-600 border-gray-500 transition-transform duration-300" : "bg-white"}
          border border-gray-300 pointer-events-auto cursor-pointer
          min-h-[36px] max-h-[36px] rounded-full
          flex justify-center items-center font-bold px-2 min-w-5
          transition-colors duration-300 ease-in-out
          ${inter.className}
        `}
      >
        <span className="px-2 whitespace-nowrap">{title}</span>
        <div>
          <Image
            className={`
              pe-2 max-map-sm:pe-0 
              w-3 h-3 min-w-[24px] min-h-[24px]
              ${active ? "invert" : ""}
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

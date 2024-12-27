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
    <button onClick={onClick}>
      <section
        className={`
          ${active ? "bg-sky-600 border-gray-500 transition-transform duration-300" : "bg-white"}
          border border-gray-300 pointer-events-auto cursor-pointer
          max-map-sm:w-10 max-map-sm:h-10 h-6 rounded-full
          flex justify-center items-center font-bold py-4 px-2 min-w-5
          transition-colors duration-300 ease-in-out
          ${inter.className}
        `}
      >
        <span className="max-map-sm:hidden px-3 whitespace-nowrap">{title}</span>
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

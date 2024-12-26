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
  const sectionStyle = `
  ${active ? "bg-blue-500 text-white" : "bg-white"}
  border border-gray-300 pointer-events-auto cursor-pointer
  max-map-sm:w-9 max-map-sm:h-9 h-6 rounded-full
  flex justify-center items-center font-bold py-4 px-2 min-w-5
  ${inter.className}
`;

  const textStyle = `max-map-sm:hidden px-3`;
  const iconStyle = `
  pe-2 max-map-sm:pe-0 
  w-6 h-6 min-w-[24px] min-h-[24px]
  ${active ? "invert" : ""}
`;

  return (
    <div onClick={onClick}>
      <section className={sectionStyle}>
        <span className={textStyle}>{title}</span>
        <div>
          <Image className={iconStyle} src={iconPath} alt="icon" width={16} height={16} />
        </div>
      </section>
    </div>
  );
}

export default Pill;

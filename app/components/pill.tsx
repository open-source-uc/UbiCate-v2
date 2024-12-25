import { Inter } from "next/font/google";
import Image from "next/image";

import React, { useEffect, useState } from "react";

interface PillProps {
  title: string;
  iconPath: string;
  active: boolean;
  onClick: () => void;
}

const inter = Inter({ subsets: ["latin"] });

function Pill({ title, iconPath, onClick, active }: PillProps) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 800);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sectionStyle = `
  ${active ? "bg-blue-500 text-white transform scale-105 shadow-xl" : "bg-white hover:bg-slate-200"}
  border border-gray-300 pointer-events-auto cursor-pointer
  max-map-sm:w-9 max-map-sm:h-9 h-6 shadow-lg rounded-full
  flex justify-between max-map-sm:justify-center items-center
  font-bold transition-all duration-300 ease-in-out py-4 px-2 min-w-5
  ${inter.className}
`;

  const textStyle = `max-map-sm:invisible select-none w-auto ${isSmallScreen ? "" : "px-3"}`;
  const iconStyle = `
  pe-2 select-none max-map-sm:pe-0 
  w-6 h-6 min-w-[24px] min-h-[24px] transition-all duration-300 ease-in-out 
  ${active ? "invert" : ""}
`;

  return (
    <div onClick={onClick}>
      <section className={sectionStyle}>
        {!isSmallScreen && <span className={textStyle}>{title}</span>}
        <div>
          <Image className={iconStyle} src={iconPath} alt="icon" width={16} height={16} />
        </div>
      </section>
    </div>
  );
}

export default Pill;

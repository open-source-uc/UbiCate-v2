import { Inter } from "next/font/google";
import Image from "next/image";

import React, { useEffect, useState } from "react";

interface PillProps {
  title: string;
  iconPath: string;
}

const inter = Inter({ subsets: ["latin"] });

function Pill({ title, iconPath }: PillProps) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 760);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="px-2 max-map-sm:flex max-map-sm:py-1 max-map-sm:justify-end">
      <section
        className={`bg-white hover:bg-slate-200 border border-gray-300 pointer-events-auto cursor-pointer max-map-sm:w-9 max-map-sm:h-9 h-6 shadow-lg rounded-full flex justify-between max-map-sm:justify-center items-center font-bold ${inter.className} `}
      >
        <p className={`max-map-sm:invisible w-auto ${isSmallScreen ? "" : "px-3"}`}>
          {!isSmallScreen && <p>{title}</p>}
        </p>
        <Image className="pe-2 max-map-sm:pe-0 w-6 max-map-sm:w-5" src={iconPath} alt="logo" width={16} height={16} />
      </section>
    </main>
  );
}

export default Pill;

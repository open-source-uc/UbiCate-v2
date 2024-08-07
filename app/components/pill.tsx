import { Inter } from "next/font/google";

import React from "react";

interface PillProps {
  title: string;
}

const inter = Inter({ subsets: ["latin"] });

function Pill({ title }: PillProps) {
  return (
    <main className="md:px-2 px-1">
      <section
        className={`bg-white max-[800px]:w-10 w-24 h-6 shadow-lg  rounded-xl flex justify-center items-center font-bold ${inter.className} `}
      >
        {title}
      </section>
    </main>
  );
}

export default Pill;

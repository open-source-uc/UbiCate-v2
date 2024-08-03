import { Inter } from "next/font/google";

import React from "react";

interface PillProps {
  title: string;
}

const inter = Inter({ subsets: ["latin"] });

// {`h-full pb-[-12px] dark:bg-dark-1 ${inter.className}`}

function Pill({ title }: PillProps) {
  return (
    <main className="px-2">
      <section
        className={`bg-white w-24 h-6 rounded-xl flex justify-center items-center font-bold ${inter.className} `}
      >
        {title}
      </section>
    </main>
  );
}

export default Pill;

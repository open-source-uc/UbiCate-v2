"use client";
import Image from "next/image";

import LandingSearch from "./components/LandingSearch";

export default function Home() {
  return (
    <section className="flex max-h-screen flex-col items-center justify-between p-24">
      <div className="relative flex place-items-center">
        <Image
          className="relative dark:invert"
          src="/logo-white.svg"
          alt="ubicate uc"
          width={180}
          height={37}
          priority
        />
      </div>
      <section>
        <LandingSearch />
      </section>
    </section>
  );
}

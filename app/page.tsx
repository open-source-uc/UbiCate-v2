"use client";
import Image from "next/image";

import { TypeAnimation } from "react-type-animation";

import LandingSearch from "./components/LandingSearch";

export default function Home() {
  const phrases = ["Salas", 800, "Bibliotecas", 800, "Laboratorios", 800];

  return (
    <section className="flex max-h-screen flex-col items-center justify-between p-10">
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
      <span className="text-6xl font-bold text-center text-white mt-10 pb-10">
        <TypeAnimation
          style={{
            width: "10rem",
          }}
          sequence={phrases}
          repeat={Infinity}
          speed={3}
        />
      </span>
      <section className="justify-center w-full align-middle items-center">
        <LandingSearch />
      </section>
    </section>
  );
}

"use client";
import React from "react";

import { TypeAnimation } from "react-type-animation";

export default function TypeAnimationWrapper() {
  const phrases = ["Salas", 800, "Baños", 800, "Bibliotecas", 800, "Laboratorios", 800];

  return (
    <span className="text-6xl font-bold text-center text-white mt-10 pb-10">
      <TypeAnimation
        className="text-black dark:text-white select-none"
        style={{
          width: "10rem",
        }}
        sequence={phrases}
        repeat={Infinity}
        speed={3}
      />
    </span>
  );
}

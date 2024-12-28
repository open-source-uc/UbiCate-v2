"use client";
import React from "react";

import { TypeAnimation } from "react-type-animation";

export default function TypeAnimationWrapper() {
  const phrases = ["Salas", 800, "Baños", 800, "Bibliotecas", 800, "Laboratorios", 800];

  return (
    <div className="max-w-full overflow-hidden">
      <span className="text-6xl font-bold text-center text-white mt-10 pb-10 block">
        <TypeAnimation
          className="text-black dark:text-white select-none"
          style={{
            display: "inline-block",
            maxWidth: "100%",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          sequence={phrases}
          repeat={Infinity}
          speed={3}
        />
      </span>
    </div>
  );
}

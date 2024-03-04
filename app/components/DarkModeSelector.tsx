"use client";
import React, { useState } from "react";

export default function DarkModeSelector() {
  const [isDark, setIsDark] = useState(false);

  const switchTheme = (theme: string) => {
    document.documentElement.classList.toggle("dark", isDark);
    setIsDark(!isDark);
  };
  return (
    <>
      <button onClick={() => switchTheme("light")}>{isDark ? "🌞" : "🌙"}</button>
    </>
  );
}

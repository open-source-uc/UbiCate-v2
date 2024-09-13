/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect } from "react";
import Image from 'next/image'; // Usar esta importación si estás en Next.js

export default function DarkModeSelector() {
  const [isDark, setIsDark] = useState(false);

  const switchTheme = () => {
    document.documentElement.classList.toggle("dark", !isDark);
    setIsDark(!isDark);
    localStorage.theme = !isDark ? "dark" : "light";
  };

  const setSystemTheme = () => {
    const savedTheme = localStorage.theme;
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      switchTheme();
    }
  };

  useEffect(() => {
    setSystemTheme();
  }, []);

  return (
    <div className="flex items-center ml-auto">
      <button className="rounded-lg hover:bg-sky-700 p-1 text-xl" onClick={() => switchTheme()}>
        {isDark ? (
          <Image src="/dark_mode.svg" alt="Dark Mode" width={24} height={24} />
        ) : (
          <Image src="/light_mode.svg" alt="Light Mode" width={24} height={24} />
        )}
      </button>
    </div>
  );
}

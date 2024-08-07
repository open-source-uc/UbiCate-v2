/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect } from "react";

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
    <div className="flex items-center">
      <button className="rounded-lg hover:bg-sky-700 p-1.5" onClick={() => switchTheme()}>
        {isDark ? "🌙" : "🌞"}
      </button>
    </div>
  );
}

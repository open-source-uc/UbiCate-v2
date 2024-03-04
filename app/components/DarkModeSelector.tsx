"use client";
import React, { useState, useEffect } from "react";

export default function DarkModeSelector() {
  const [isDark, setIsDark] = useState(false);

  const switchTheme = () => {
    const newIsDark = !isDark;
    document.documentElement.classList.toggle("dark", newIsDark);
    setIsDark(newIsDark);
    localStorage.theme = newIsDark ? "dark" : "light";
  };

  useEffect(() => {
    const savedTheme = localStorage.theme;
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      switchTheme();
    }
  }, []);

  return (
    <>
      <button onClick={() => switchTheme()}>{isDark ? "🌙" : "🌞"}</button>
    </>
  );
}

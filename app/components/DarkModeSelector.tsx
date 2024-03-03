"use client";
import React from "react";

export default function DarkModeSelector() {
  const switchTheme = (theme: string) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  };
  return (
    <>
      <button onClick={() => switchTheme("light")}>Light Mode</button>
      <button onClick={() => switchTheme("dark")}>Dark Mode</button>
    </>
  );
}

"use client";

import Link from "next/link";

import { AlignJustify } from "lucide-react";

import { useSidebar } from "../context/sidebarCtx";

import DarkModeSelector from "./darkModeSelector";

export default function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="w-full select-none text-white h-12 flex items-center relative z-30">
      <div className="w-full h-12 fixed flex items-center bg-sky-600 px-4">
        <div className="flex items-center mr-4">
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-sky-700">
            <AlignJustify />
          </button>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 font-bold font-heading text-xl">
          <Link href="/">UbiCate UC</Link>
        </div>

        <DarkModeSelector />
      </div>
    </header>
  );
}

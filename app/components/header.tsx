"use client";

import Link from "next/link";

import { AlignJustify } from "lucide-react";

import { useSidebar } from "../context/sidebarCtx";

import DarkModeSelector from "./darkModeSelector";

export default function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="w-full select-none text-white h-12 flex items-center bg-sky-600 px-4">
      <div className="flex items-center mr-4">
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-sky-700">
          <AlignJustify />
        </button>
      </div>

      <div className="flex-1 text-center text-xl font-bold font-heading">
        <Link href="/">UbiCate UC</Link>
      </div>

      <DarkModeSelector />
    </header>
  );
}

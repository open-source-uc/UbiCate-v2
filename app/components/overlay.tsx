"use client";

import { useSidebar } from "../context/sidebarCtx";

export default function Overlay() {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <div
      onClick={toggleSidebar}
      className={`fixed inset-0 bg-brown-medium bg-opacity-50 transition-opacity duration-300 z-20  ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden="true"
    />
  );
}

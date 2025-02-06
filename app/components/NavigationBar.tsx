// Language: TSX
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useState } from "react";

import { useSidebar } from "../context/sidebarCtx";
import LandingSearch from "./landingSearch";

type SubSidebarType = "buscar" | "campus" | "guías" | null;

export default function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const searchParams = useSearchParams();
  const [activeSubSidebar, setActiveSubSidebar] = useState<SubSidebarType>(null);

  const toggleSubSidebar = (type: SubSidebarType) => {
    setActiveSubSidebar((prev) => (prev === type ? null : type));
  };

  // Handle button click in collapsed sidebar
  const handleCollapsedClick = (type: SubSidebarType) => {
    toggleSidebar(); // expand main sidebar
    toggleSubSidebar(type); // open specific sub sidebar
  };

  return (
    <>
      {/* Collapsed Sidebar */}
      {!isOpen && (
        <aside className="fixed inset-y-0 left-0 bg-brown-dark text-white-ubi flex flex-col z-50">
          <div className="flex flex-col items-center py-8 px-4 space-y-6">
            <div className="mb-9 flex justify-center">
              <button onClick={toggleSidebar} className="hover:text-brown-medium">
                <span className="material-symbols-outlined self-center">dock_to_right</span>
              </button>
            </div>
            <button
              onClick={() => handleCollapsedClick("buscar")}
              className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center hover:bg-brown-medium"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            <button
              onClick={() => handleCollapsedClick("campus")}
              className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center hover:bg-brown-medium"
            >
              <span className="material-symbols-outlined">map</span>
            </button>
            <button
              onClick={() => handleCollapsedClick("guías")}
              className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center hover:bg-brown-medium"
            >
              <span className="material-symbols-outlined">menu_book</span>
            </button>
          </div>
        </aside>
      )}

      {/* Expanded Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-brown-dark text-white-ubi text-snow transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full py-5 px-4 space-y-6">
          {/* Logo and Button to Close Sidebar */}
          <div className="flex items-center justify-between">
            <Link href="/">
              <img src="/long-logo.svg" className="pl-2" alt="Logo" width={"120rm"} />
            </Link>
            <div className="flex-row-reverse">
              <button onClick={toggleSidebar} className="hover:text-brown-medium">
                <span className="material-symbols-outlined">dock_to_right</span>
              </button>
            </div>
          </div>

          {/* Navigation Options */}
          <nav className="flex-1">
            <div className="pt-5 space-y-2">
              <button
                onClick={() => toggleSubSidebar("buscar")}
                className="w-full flex items-center space-x-4 p-2 rounded-md hover:bg-brown-medium"
              >
                <span
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeSubSidebar === "buscar" ? "bg-blue-location" : "bg-brown-light"
                  }`}
                >
                  <span className="material-symbols-outlined">search</span>
                </span>
                <span>Buscar</span>
              </button>
              <button
                onClick={() => toggleSubSidebar("campus")}
                className="w-full flex items-center space-x-4 p-2 rounded-md hover:bg-brown-medium"
              >
                <span
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeSubSidebar === "campus" ? "bg-blue-location" : "bg-brown-light"
                  }`}
                >
                  <span className="material-symbols-outlined">map</span>
                </span>
                <span>Campus</span>
              </button>
              <button
                onClick={() => toggleSubSidebar("guías")}
                className="w-full flex items-center space-x-4 p-2 rounded hover:bg-brown-medium"
              >
                <span
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeSubSidebar === "guías" ? "bg-blue-location" : "bg-brown-light"
                  }`}
                >
                  <span className="material-symbols-outlined">menu_book</span>
                </span>
                <span>Guías</span>
              </button>
            </div>
          </nav>

          {/* Buttons for Promotion */}
          <div className="flex-col space-y-4">
            <div className="w-full rounded-xl bg-brown-light">
              <div className="text-xs text-white-blue p-4">
                ¿Crees que algo falta?
                <Link
                  href={`/form-geo/${
                    searchParams.get("campus") ? `?campus=${searchParams.get("campus")}` : ""
                  }`}
                  className="font-semibold block hover:underline"
                >
                  Ayúdanos agregándolo
                </Link>
              </div>
            </div>
            <div className="w-full rounded-xl bg-blue-location">
              <div className="text-xs text-white-blue p-4">
                Proyecto desarrollado por
                <a href="https://osuc.dev" className="font-semibold block hover:underline">
                  Open Source eUC
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Sidebar inside Expanded Sidebar */}
        {isOpen && activeSubSidebar && (
          <aside
            className={`absolute top-0 left-full h-full w-96 border-1 border-l border-brown-light bg-brown-dark text-white-ubi transform transition-transform duration-300 z-60 ${
              activeSubSidebar ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="py-7 px-4 space-y-6">
              {activeSubSidebar === "buscar" && (
                <>
                  <h3 className="font-bold text-lg">Buscar</h3>
                  <ul className="space-y-2">
                    <LandingSearch />
                  </ul>
                </>
              )}
              {activeSubSidebar === "campus" && (
                <>
                  <h3 className="font-bold mb-4">Campus Options</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/campus/option1" className="hover:underline">
                        Campus Option 1
                      </Link>
                    </li>
                    <li>
                      <Link href="/campus/option2" className="hover:underline">
                        Campus Option 2
                      </Link>
                    </li>
                    <li>
                      <Link href="/campus/option3" className="hover:underline">
                        Campus Option 3
                      </Link>
                    </li>
                  </ul>
                </>
              )}
              {activeSubSidebar === "guías" && (
                <>
                  <h3 className="font-bold mb-4">Guías Options</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/guías/option1" className="hover:underline">
                        Guías Option 1
                      </Link>
                    </li>
                    <li>
                      <Link href="/guías/option2" className="hover:underline">
                        Guías Option 2
                      </Link>
                    </li>
                    <li>
                      <Link href="/guías/option3" className="hover:underline">
                        Guías Option 3
                      </Link>
                    </li>
                  </ul>
                </>
              )}
              <button
                onClick={() => toggleSubSidebar(activeSubSidebar)}
                className="mt-4 text-sm hover:underline"
              >
                Close
              </button>
            </div>
          </aside>
        )}
      </aside>
    </>
  );
}
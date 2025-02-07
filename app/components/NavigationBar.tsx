"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { Suspense, useState } from "react";

import { useSidebar } from "../context/sidebarCtx";

import LandingSearch from "./landingSearch";

type SubSidebarType = "buscar" | "campus" | "guías" | null;

export default function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const searchParams = useSearchParams();
  const [activeSubSidebar, setActiveSubSidebar] = useState<SubSidebarType>(null);
  const router = useRouter();

  const toggleSubSidebar = (type: SubSidebarType) => {
    setActiveSubSidebar((prev) => (prev === type ? null : type));
  };

  const handleCollapsedClick = (type: SubSidebarType) => {
    toggleSidebar(); 
    toggleSubSidebar(type);
  };

  const handleCampusClick = (campusName: string) => {
    router.push(`/map?campus=${campusName}`);
    toggleSidebar();
    setActiveSubSidebar(null);
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
              disabled
              className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center opacity-50 cursor-not-allowed pointer-events-none"
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
                disabled
                className="w-full flex items-center space-x-4 p-2 rounded-sm opacity-50 cursor-not-allowed pointer-events-none"
              >
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center bg-brown-light`}>
                  <span className="material-symbols-outlined">menu_book</span>
                </span>
                <span>Guías</span>
              </button>
            </div>
          </nav>

          {/* Sections for Feedback and OSUC */}
          <div className="flex-col space-y-4">
            <div className="w-full rounded-xl bg-brown-light">
              <div className="text-xs text-white-blue p-4">
                ¿Crees que algo falta?
                <Link
                  href={`/form-geo/${searchParams.get("campus") ? `?campus=${searchParams.get("campus")}` : ""}`}
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
        {isOpen && activeSubSidebar ? (
          <aside
            className={`absolute top-0 left-full h-full w-96 border-l-1 border-brown-light bg-brown-dark text-white-ubi transform transition-transform duration-300 z-60 ${
              activeSubSidebar ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="py-7 px-4 space-y-6">
              {activeSubSidebar === "buscar" && (
                <>
                  <h3 className="font-bold text-lg">Buscar</h3>
                  <ul className="space-y-2">
                    <Suspense>
                      <LandingSearch />
                    </Suspense>
                  </ul>
                </>
              )}
              {activeSubSidebar === "campus" && (
                <>
                  <h3 className="font-bold text-lg">Campus</h3>
                  <div className="w-full space-y-4">
                    <button
                      className="relative w-full h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                      onClick={() => handleCampusClick("SanJoaquin")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("SanJoaquin")}
                      aria-label="Navega a Campus San Joaquín"
                      role="navigation"
                      tabIndex={0}
                    >
                      <Image
                        src="/images/campus/san_joaquin.jpg"
                        alt="Campus San Joaquín"
                        fill
                        className="object-cover rounded-lg transition-transform duration-300"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brown-dark/100 rounded-lg" />
                      <div className="absolute inset-0 bg-brown-light/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 rounded-lg" />
                      <div className="absolute bottom-0 left-0 p-4">
                        <span className="text-white-ubi text-md font-semibold" aria-hidden="true">
                          San Joaquín
                        </span>
                      </div>
                    </button>

                    <button
                      className="relative w-full h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                      onClick={() => handleCampusClick("CasaCentral")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("CasaCentral")}
                      aria-label="Navega a Campus Casa Central"
                      role="navigation"
                      tabIndex={0}
                    >
                      <Image
                        src="/images/campus/casa_central.jpg"
                        alt="Campus Casa Central"
                        fill
                        className="object-cover rounded-lg transition-transform duration-300"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brown-dark/100 rounded-lg" />
                      <div className="absolute inset-0 bg-brown-light/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 rounded-lg" />
                      <div className="absolute bottom-0 left-0 p-4">
                        <span className="text-white-ubi text-md font-semibold" aria-hidden="true">
                          Casa Central
                        </span>
                      </div>
                    </button>

                    <button
                      className="relative w-full h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                      onClick={() => handleCampusClick("Oriente")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("Oriente")}
                      aria-label="Navega a Campus Oriente"
                      role="navigation"
                      tabIndex={0}
                    >
                      <Image
                        src="/images/campus/oriente.jpg"
                        alt="Campus Oriente"
                        fill
                        className="object-cover rounded-lg transition-transform duration-300"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brown-dark/100 rounded-lg" />
                      <div className="absolute inset-0 bg-brown-light/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 rounded-lg" />
                      <div className="absolute bottom-0 left-0 p-4">
                        <span className="text-white-ubi text-md font-semibold" aria-hidden="true">
                          Oriente
                        </span>
                      </div>
                    </button>

                    <button
                      className="relative w-full h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                      onClick={() => handleCampusClick("LoContador")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("LoContador")}
                      aria-label="Navega a Campus Lo Contador"
                      role="navigation"
                      tabIndex={0}
                    >
                      <Image
                        src="/images/campus/lo_contador.jpg"
                        alt="Campus Lo Contador"
                        fill
                        className="object-cover rounded-lg transition-transform duration-300"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brown-dark/100 rounded-lg" />
                      <div className="absolute inset-0 bg-brown-light/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 rounded-lg" />
                      <div className="absolute bottom-0 left-0 p-4">
                        <span className="text-white-ubi text-md font-semibold" aria-hidden="true">
                          Lo Contador
                        </span>
                      </div>
                    </button>

                    <button
                      className="relative w-full h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                      onClick={() => handleCampusClick("Villarrica")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("Villarrica")}
                      aria-label="Navega a Campus Villarrica"
                      role="navigation"
                      tabIndex={0}
                    >
                      <Image
                        src="/images/campus/villarrica.png"
                        alt="Campus Villarrica"
                        fill
                        className="object-cover rounded-lg transition-transform duration-300"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brown-dark/100 rounded-lg" />
                      <div className="absolute inset-0 bg-brown-light/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 rounded-lg" />
                      <div className="absolute bottom-0 left-0 p-4">
                        <span className="text-white-ubi text-md font-semibold" aria-hidden="true">
                          Villarrica
                        </span>
                      </div>
                    </button>
                  </div>
                </>
              )}
              {activeSubSidebar === "guías" && (
                <>
                  <h3 className="font-bold text-lg">Guías</h3>
                  <ul className="space-y-2">Hello. This is not implemented.</ul>
                </>
              )}
              <button onClick={() => toggleSubSidebar(activeSubSidebar)} className="mt-4 text-sm hover:underline">
                Close
              </button>
            </div>
          </aside>
        ) : null}
      </aside>
    </>
  );
}

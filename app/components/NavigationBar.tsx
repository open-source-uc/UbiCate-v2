"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { useSidebar } from "../context/sidebarCtx";
import MenuInformation from "../map/menuInformation";

import PillFilter from "./pillFilter";

type SubSidebarType = "buscar" | "campus" | "guías" | "menuInformation" | null;

export default function Sidebar() {
  const { isOpen, toggleSidebar, geocoder, setPlaces, selectedPlace, setSelectedPlace } = useSidebar();
  const searchParams = useSearchParams();
  const [activeSubSidebar, setActiveSubSidebar] = useState<SubSidebarType>(null);
  const refSearchContainer = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const toggleSubSidebar = (type: SubSidebarType) => {
    setActiveSubSidebar((prev) => (prev === type ? null : type));
  };

  const handleCollapsedClick = (type: SubSidebarType) => {
    toggleSidebar();
    toggleSubSidebar(type);
  };

  const handleSearchSelection = () => {
    toggleSidebar();
    setActiveSubSidebar(null);
  };

  const handleCampusClick = (campusName: string) => {
    router.push(`/map?campus=${campusName}`);
    toggleSidebar();
    setActiveSubSidebar(null);
  };

  // When a place is selected, make the MenuInformation a subsidebar.
  useEffect(() => {
    if (selectedPlace) {
      setActiveSubSidebar("menuInformation");
      if (!isOpen) {
        toggleSidebar();
      }
    }
  }, [selectedPlace]);

  // Add the geocoder to the search container when the "buscar" subsidebar is open
  useEffect(() => {
    if (refSearchContainer.current) geocoder.current?.addTo(refSearchContainer.current);
  }, [activeSubSidebar, geocoder]);

  // Collapse the sidebar when a search result is selected
  useEffect(() => {
    let current: null | MapboxGeocoder = null;
    if (activeSubSidebar === "buscar" && geocoder.current) {
      geocoder.current?.on("result", handleSearchSelection);
      current = geocoder.current;
    }
    return () => {
      current?.off("result", handleSearchSelection);
    };
  }, [activeSubSidebar, geocoder]);

  return (
    <>
      {/* Collapsed Sidebar */}
      {!isOpen && (
        <aside
          className={`
          fixed 
          bg-brown-dark/95
          backdrop-blur-sm 
          text-white-ubi 
          flex 
          flex-col 
          z-50
          
          /* Mobile & Tablet */
          max-desktop:inset-x-0
          max-desktop:bottom-0
          max-desktop:h-24
          
          /* Desktop */
          desktop:left-0
          desktop:inset-y-0
          desktop:h-full
          desktop:w-auto
        `}
        >
          <div
            className={`
            flex 
            items-center 
            p-4 
            space-y-4
            flex-col

            desktop:py-8
            desktop:space-y-6
          `}
          >
            {/* Options available for Tablet and Mobile */}
            <button
              onClick={toggleSidebar}
              className="desktop:hidden mx-auto w-1/8 p-1 bg-brown-medium rounded-full hover:bg-brown-dark transition-colors"
              aria-label="Toggle sidebar"
            />

            {/* Options available for Desktop */}
            <div className="max-desktop:hidden mb-9 flex justify-center">
              <button onClick={toggleSidebar} className="hover:text-brown-medium pointer-events-auto cursor-pointer">
                <span className="material-symbols-outlined self-center">dock_to_right</span>
              </button>
            </div>
            <button
              onClick={() => handleCollapsedClick("buscar")}
              className="max-desktop:hidden w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center hover:bg-brown-medium pointer-events-auto cursor-pointer"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            <button
              onClick={() => handleCollapsedClick("campus")}
              className="max-desktop:hidden w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center hover:bg-brown-medium pointer-events-auto cursor-pointer"
            >
              <span className="material-symbols-outlined">map</span>
            </button>
            <button
              onClick={() => handleCollapsedClick("guías")}
              disabled
              className="max-desktop:hidden w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center opacity-50 pointer-events-auto cursor-pointer"
            >
              <span className="material-symbols-outlined">menu_book</span>
            </button>
          </div>
        </aside>
      )}

      {/* Expanded Sidebar */}
      <aside
        className={`
          fixed bg-brown-dark/95 backdrop-blur-sm text-white-ubi text-snow transform transition-transform duration-300 z-50
          /* Desktop */
          desktop:inset-y-0 desktop:left-0 desktop:w-64 ${
            isOpen ? "desktop:translate-x-0" : "desktop:-translate-x-full"
          }
          /* Mobile & Tablet */
          max-desktop:inset-x-0 max-desktop:bottom-0 max-desktop:h-120 ${
            isOpen ? "max-desktop:translate-y-0" : "max-desktop:translate-y-full"
          }
        `}
      >
        <div className="flex flex-col h-full py-5 px-4 space-y-4">
          {/* Option available for Tablet and Mobile */}
          <button
            onClick={toggleSidebar}
            className="desktop:hidden mx-auto w-1/8 p-1 bg-brown-medium rounded-full hover:bg-brown-dark transition-colors"
            aria-label="Toggle sidebar"
          />

          {/* Logo and Button to Close Sidebar | Desktop Only */}
          <div className="max-desktop:hidden flex items-center justify-between">
            <Link href="/">
              <img src="/long-logo.svg" className="pl-2" alt="Logo" width={"120rm"} />
            </Link>
            <div className="flex-row-reverse">
              <button onClick={toggleSidebar} className="hover:text-brown-medium pointer-events-auto cursor-pointer">
                <span className="material-symbols-outlined">dock_to_right</span>
              </button>
            </div>
          </div>

          {/* Navigation Options */}
          <nav className="desktop:flex-1">
            <div className="pt-5 space-y-2 flex desktop:flex-col">
              <button
                onClick={() => toggleSubSidebar("buscar")}
                className="max-desktop:hidden w-full flex items-center space-x-4 p-2 rounded-md hover:bg-brown-medium pointer-events-auto cursor-pointer"
              >
                <span
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeSubSidebar === "buscar" ? "bg-blue-location" : "bg-brown-light"
                  }`}
                >
                  <span className="material-symbols-outlined">search</span>
                </span>
                <span className="text-md">Buscar</span>
              </button>
              <div className="flex flex-1 flex-col space-y-2">
                <p className="text-md font-semibold text-white-ubi desktop:hidden">Explora</p>
                <div className="bg-brown-medium flex flex-1 rounded-lg p-2 mb-2 desktop:flex-col desktop:space-y-2 desktop:bg-transparent desktop:p-0 desktop:mb-0">
                  <button
                    onClick={() => toggleSubSidebar("campus")}
                    className="w-full flex flex-col desktop:flex-row items-center justify-center desktop:justify-start space-x-0 desktop:space-x-4 p-2 rounded-md hover:bg-brown-light/20 pointer-events-auto cursor-pointer"
                  >
                    <span
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeSubSidebar === "campus" ? "bg-blue-location" : "bg-brown-light"
                      }`}
                    >
                      <span className="material-symbols-outlined">map</span>
                    </span>
                    <p className="text-sm tablet:text-md mt-1 desktop:mt-0">Campus</p>
                  </button>
                  <button
                    onClick={() => toggleSubSidebar("guías")}
                    disabled
                    className="w-full flex flex-col desktop:flex-row items-center justify-center desktop:justify-start space-x-0 desktop:space-x-4 p-2 rounded-md opacity-50"
                  >
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center bg-brown-light`}>
                      <span className="material-symbols-outlined">menu_book</span>
                    </span>
                    <p className="text-sm tablet:text-md mt-1 desktop:mt-0">Guías</p>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Sections for Feedback and OSUC */}
          <div className="flex flex-row gap-4 tablet:gap-4 mobile:gap-2 mobile:flex-row tablet:flex-row desktop:flex-col desktop:space-y-4 desktop:gap-0">
            <div className="w-full rounded-xl bg-brown-light">
              <div className="text-xs text-white-blue p-4 mobile:p-3 tablet:p-4">
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
              <div className="text-xs text-white-blue p-4 mobile:p-3 tablet:p-4">
                Desarrollado por
                <a href="https://osuc.dev" className="font-semibold block hover:underline">
                  Open Source eUC
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Sidebar inside Expanded Sidebar */}
        {(isOpen && activeSubSidebar) || activeSubSidebar === "menuInformation" ? (
          <aside
            className={`
          absolute bg-brown-dark/95 backdrop-blur-sm text-white-ubi transform transition-transform duration-300 z-60
          /* Desktop: Positioned to the right */
          desktop:top-0 desktop:left-full desktop:h-full desktop:w-96 desktop:border-l-1 desktop:border-brown-light ${
            activeSubSidebar ? "desktop:translate-x-0" : "desktop:translate-x-full"
          }
          /* Mobile & Tablet: Positioned overlaying the expanded sidebar */
          max-desktop:inset-0 max-desktop:border-t-1 max-desktop:border-brown-light ${
            activeSubSidebar ? "max-desktop:translate-y-0" : "max-desktop:translate-y-full"
          }
        `}
          >
            <div className="py-7 px-4 space-y-6">
              {activeSubSidebar === "buscar" && (
                <>
                  <h3 className="font-bold text-lg">Buscar</h3>
                  <ul className="space-y-8">
                    <section ref={refSearchContainer} />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-md">Filtra por lugares</h4>
                      <PillFilter setFilteredPlaces={setPlaces} />
                    </div>
                  </ul>
                </>
              )}
              {activeSubSidebar === "campus" && (
                <>
                  <h3 className="font-bold text-lg">Campus</h3>
                  <div className="w-full grid grid-cols-2 gap-2 tablet:gap-3 desktop:grid-cols-1 desktop:gap-4">
                    <button
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      <div className="absolute bottom-0 left-0 p-2 tablet:p-3 md:p-4">
                        <span className="text-white-ubi text-sm mobile:text-md font-semibold" aria-hidden="true">
                          San Joaquín
                        </span>
                      </div>
                    </button>

                    <button
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      <div className="absolute bottom-0 left-0 p-2 tablet:p-3 md:p-4">
                        <span className="text-white-ubi text-sm md:text-md font-semibold" aria-hidden="true">
                          Casa Central
                        </span>
                      </div>
                    </button>

                    <button
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      <div className="absolute bottom-0 left-0 p-2 tablet:p-3 md:p-4">
                        <span className="text-white-ubi text-sm md:text-md font-semibold" aria-hidden="true">
                          Oriente
                        </span>
                      </div>
                    </button>

                    <button
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      <div className="absolute bottom-0 left-0 p-2 tablet:p-3 md:p-4">
                        <span className="text-white-ubi text-sm md:text-md font-semibold" aria-hidden="true">
                          Lo Contador
                        </span>
                      </div>
                    </button>

                    <button
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] col-span-2 md:col-span-1 rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      <div className="absolute bottom-0 left-0 p-2 tablet:p-3 md:p-4">
                        <span className="text-white-ubi text-sm md:text-md font-semibold" aria-hidden="true">
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
              {activeSubSidebar === "menuInformation" && (
                <MenuInformation
                  place={selectedPlace}
                  onClose={() => {
                    setSelectedPlace(null);
                    setActiveSubSidebar(null);
                  }}
                />
              )}
              <button
                onClick={() => toggleSubSidebar(activeSubSidebar)}
                className="absolute top-8 right-4 text-white-ubi bg-brown-light flex items-center align-middle rounded-full hover:text-brown-light hover:bg-brown-medium pointer-events-auto cursor-pointer  focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                aria-label="Cerrar menú"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </aside>
        ) : null}
      </aside>
    </>
  );
}

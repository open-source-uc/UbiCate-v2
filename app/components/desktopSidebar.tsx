"use client";
import "../custom-landing-geocoder.css";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { SubSidebarType } from "@/utils/types";

import * as Icons from "../components/icons/icons";
import { useSidebar } from "../context/sidebarCtx";
import MenuInformation from "../map/menuInformation";

import CampusList from "./campusList";
import FooterOptionsSidebar from "./footerOptionsSidebar";
import PillFilter from "./pillFilterBar";

export default function DesktopSidebar() {
  const { isOpen, setIsOpen, toggleSidebar, geocoder, selectedPlace, setSelectedPlace } = useSidebar();
  const [activeSubSidebar, setActiveSubSidebar] = useState<SubSidebarType>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const refSearchContainer = useRef<HTMLDivElement | null>(null);

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  const toggleSubSidebar = (type: SubSidebarType) => {
    setActiveSubSidebar((prev) => (prev === type ? null : type));
  };

  const handleCollapsedClick = (type: SubSidebarType) => {
    toggleSubSidebar(type);
  };

  const handleSearchSelection = () => {
    handleToggleSidebar();
    setActiveSubSidebar(null);
  };

  const handleCampusClick = (campusName: string) => {
    router.push(`/?campus=${campusName}`);
    handleToggleSidebar();
    setActiveSubSidebar(null);
  };

  // Cuando se selecciona un lugar, muestra "menuInformation"
  useEffect(() => {
    if (selectedPlace !== null) {
      setActiveSubSidebar("menuInformation");
    }
    if (selectedPlace === null) {
      setActiveSubSidebar(null);
      setIsOpen(false);
    }
  }, [selectedPlace, setIsOpen]);

  // Añade el geocoder cuando se abre el subsidebar "buscar"
  useEffect(() => {
    if (activeSubSidebar === "buscar" && refSearchContainer.current) {
      geocoder.current?.addTo(refSearchContainer.current);
    }
  }, [activeSubSidebar, geocoder]);

  // Cierra el sidebar al seleccionar un resultado de búsqueda
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
      {/* Contenedor principal con flex row */}
      <div className="flex h-screen">
        {/* Sidebar principal */}
        <section
          className={`bg-brown-dark/95 backdrop-blur-sm text-white-ubi flex flex-col z-40 h-full transition-all duration-200 pb-4 ${
            isOpen ? "w-60" : "w-20"
          }`}
        >
          <div className={`flex items-center p-4 ${isOpen ? "flex-row justify-between" : "flex-col py-8 space-y-6"}`}>
            {/* Logo - visible only when expanded */}
            <Link href="/" className={`${isOpen ? "block" : "hidden"}`}>
              <img src="/long-logo.svg" className="pl-2" alt="Logo" width="118" />
            </Link>

            {/* Toggle button */}
            <div className={`${isOpen ? "" : "flex justify-center"}`}>
              <button onClick={toggleSidebar} className="hover:text-brown-medium pointer-events-auto cursor-pointer">
                <Icons.DockToRight className="w-9 h-9" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <div className={`${isOpen ? "pt-5 px-4" : ""} flex flex-col`}>
              {/* Search button */}
              <button
                onClick={() => (isOpen ? toggleSubSidebar("buscar") : handleCollapsedClick("buscar"))}
                className={`${
                  isOpen ? "w-full p-2 rounded-md hover:bg-brown-medium" : ""
                } flex items-center pointer-events-auto cursor-pointer ${
                  !isOpen ? "justify-center px-4 py-3" : "space-x-4"
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeSubSidebar === "buscar" ? "bg-blue-location" : "bg-brown-light"
                  }`}
                >
                  <Icons.Search />
                </span>
                <span className={`text-md ${isOpen ? "block" : "hidden"}`}>Buscar</span>
              </button>

              {/* Campus button */}
              <button
                onClick={() => (isOpen ? toggleSubSidebar("campus") : handleCollapsedClick("campus"))}
                className={`${
                  isOpen ? "w-full p-2 rounded-md hover:bg-brown-light/18" : ""
                } flex items-center pointer-events-auto cursor-pointer ${
                  !isOpen ? "justify-center px-4 py-3" : "space-x-4"
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeSubSidebar === "campus" ? "bg-blue-location" : "bg-brown-light"
                  }`}
                >
                  <Icons.Map />
                </span>
                <span className={`text-md ${isOpen ? "block" : "hidden"}`}>Campus</span>
              </button>

              {/* Guides button */}
              <button
                disabled
                className={`${isOpen ? "w-full p-2 rounded-md opacity-50" : ""} flex items-center ${
                  !isOpen ? "justify-center px-4 py-3 opacity-50" : "space-x-4"
                }`}
              >
                <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-brown-light">
                  <Icons.MenuBook />
                </span>
                <span className={`text-md ${isOpen ? "block" : "hidden"}`}>Guías</span>
              </button>
            </div>
          </nav>

          {/* Footer - visible only when expanded */}
          <div className={`flex flex-col space-y-4 px-4 ${isOpen ? "block" : "hidden"}`}>
            <FooterOptionsSidebar />
          </div>
        </section>

        {/* Segunda sección - subsidebar - always rendered but with dynamic width */}
        <section
          className={`shadow-lg h-full overflow-hidden bg-brown-dark/95 backdrop-blur-sm text-white-ubi transition-all duration-200 border-l-1 border-brown-light ${
            activeSubSidebar !== null ? "w-80 opacity-100 p-4" : "w-0 opacity-0 p-0"
          }`}
        >
          <div className={`${activeSubSidebar !== null ? "block overflow-auto h-full" : "hidden"}`}>
            {activeSubSidebar === "campus" && (
              <div className="w-full h-full">
                <CampusList handleCampusClick={handleCampusClick} setActiveSubSidebar={setActiveSubSidebar} />
              </div>
            )}
            {activeSubSidebar === "guías" && (
              <>
                <h3 className="font-bold text-lg">Guías</h3>
                <ul className="space-y-2">Hello. This is not implemented.</ul>
              </>
            )}
            {activeSubSidebar === "menuInformation" && (
              <div className="w-full h-full">
                <MenuInformation
                  place={selectedPlace}
                  onClose={() => {
                    setSelectedPlace(null);
                    toggleSubSidebar(null);
                  }}
                />
              </div>
            )}
            {activeSubSidebar === "buscar" && (
              <div className="w-full h-full overflow-auto">
                <h3 className="font-bold text-lg">Buscar</h3>
                <div className="p-1">
                  <section ref={refSearchContainer} />
                </div>
                <div>
                  <h4 className="font-semibold text-md">Filtra por lugares</h4>
                  <PillFilter />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

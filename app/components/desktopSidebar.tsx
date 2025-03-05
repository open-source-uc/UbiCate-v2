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
  const { isOpen, setIsOpen, toggleSidebar, geocoder, setPlaces, selectedPlace, setSelectedPlace } = useSidebar();
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
    handleToggleSidebar();
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
      setIsOpen(true);
      setActiveSubSidebar("menuInformation");
    }
    if (selectedPlace === null) {
      setActiveSubSidebar(null);
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

  useEffect(() => {
    if (isOpen === false) {
      setActiveSubSidebar(null);
    }
  }, [isOpen]);

  return (
    <>
      {/* Sidebar colapsado */}
      {!isOpen && (
        <section className="fixed bg-brown-dark/95 backdrop-blur-sm text-white-ubi flex flex-col z-50 left-0 inset-y-0 h-full w-auto">
          <div className="flex items-center p-4 flex-col py-8 space-y-6">
            <div className="mb-9 flex justify-center">
              <button onClick={toggleSidebar} className="hover:text-brown-medium pointer-events-auto cursor-pointer">
                <Icons.DockToRight className="w-9 h-9" />
              </button>
            </div>
            <button
              onClick={() => handleCollapsedClick("buscar")}
              className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center hover:bg-brown-medium pointer-events-auto cursor-pointer"
            >
              <Icons.Search />
            </button>
            <button
              onClick={() => handleCollapsedClick("campus")}
              className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center hover:bg-brown-medium pointer-events-auto cursor-pointer"
            >
              <Icons.Map />
            </button>
            <button
              disabled
              className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center opacity-50 pointer-events-auto cursor-pointer"
            >
              <Icons.MenuBook />
            </button>
          </div>
        </section>
      )}

      {/* Sidebar expandido */}
      <section
        className={`fixed bg-brown-dark/95 backdrop-blur-sm text-white-ubi text-snow transform transition-transform duration-300 z-50 inset-y-0 left-0 w-64 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full py-5 px-4 space-y-4">
          {/* Logo y botón para cerrar */}
          <div className="flex items-center justify-between">
            <Link href="/">
              <img src="/long-logo.svg" className="pl-2" alt="Logo" width="118" />
            </Link>
            <div className="flex-row-reverse">
              <button onClick={toggleSidebar} className="hover:text-brown-medium pointer-events-auto cursor-pointer">
                <Icons.DockToRight className="w-9 h-9" />
              </button>
            </div>
          </div>

          {/* Opciones de navegación */}
          <nav className="flex-1">
            <div className="pt-5 flex flex-col">
              <button
                onClick={() => toggleSubSidebar("buscar")}
                className="w-full flex items-center space-x-4 p-2 rounded-md hover:bg-brown-medium pointer-events-auto cursor-pointer"
              >
                <span
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeSubSidebar === "buscar" ? "bg-blue-location" : "bg-brown-light"
                  }`}
                >
                  <Icons.Search />
                </span>
                <span className="text-md">Buscar</span>
              </button>
              <div className="flex flex-col space-y-2">
                <div className="bg-transparent p-0 mb-0">
                  <button
                    onClick={() => toggleSubSidebar("campus")}
                    className="w-full flex flex-row items-center justify-start space-x-4 p-2 rounded-md hover:bg-brown-light/18 pointer-events-auto cursor-pointer"
                  >
                    <span
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeSubSidebar === "campus" ? "bg-blue-location" : "bg-brown-light"
                      }`}
                    >
                      <Icons.Map />
                    </span>
                    <p className="text-md">Campus</p>
                  </button>
                  <button
                    onClick={() => toggleSubSidebar("guías")}
                    disabled
                    className="w-full flex flex-row items-center justify-start space-x-4 p-2 rounded-md opacity-50"
                  >
                    <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-brown-light">
                      <Icons.MenuBook />
                    </span>
                    <p className="text-md">Guías</p>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Secciones de Feedback y OSUC */}
          <div className="flex flex-col space-y-4">
            <FooterOptionsSidebar />
          </div>
        </div>

        {/* Subsidebar (Desktop) integrado */}
        {(isOpen && activeSubSidebar) || activeSubSidebar === "menuInformation" ? (
          <section
            className={`absolute bg-brown-dark/95 backdrop-blur-sm text-white-ubi transform transition-transform duration-300 z-60
        desktop:top-0 desktop:left-full desktop:h-full desktop:w-96 desktop:overflow-hidden
        max-desktop:inset-0 max-desktop:border-t-1 max-desktop:border-brown-light
        desktop:border-l-1 desktop:border-brown-light
        ${activeSubSidebar ? "desktop:translate-x-0" : "desktop:translate-x-full"}
        ${activeSubSidebar ? "max-desktop:translate-y-0" : "max-desktop:translate-y-full"}`}
          >
            <div className={`h-full overflow-y-auto ${activeSubSidebar === "menuInformation" ? "" : ""}`}>
              <div className="py-7 px-4 space-y-6 relative">
                {activeSubSidebar === "buscar" && (
                  <>
                    <h3 className="font-bold text-lg">Buscar</h3>
                    <ul className="space-y-8 overflow-y-auto">
                      <div className="p-1 ">
                        <section ref={refSearchContainer} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-md">Filtra por lugares</h4>
                        <PillFilter />
                      </div>
                    </ul>
                  </>
                )}
                {activeSubSidebar === "campus" && (
                  <CampusList handleCampusClick={handleCampusClick} setActiveSubSidebar={setActiveSubSidebar} />
                )}
                {activeSubSidebar === "guías" && (
                  <>
                    <h3 className="font-bold text-lg">Guías</h3>
                    <ul className="space-y-2">Hello. This is not implemented.</ul>
                  </>
                )}
                {activeSubSidebar === "menuInformation" && (
                  <div className="h-full overflow-y-auto">
                    <MenuInformation
                      place={selectedPlace}
                      onClose={() => {
                        setSelectedPlace(null);
                        toggleSubSidebar(null);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}
      </section>
    </>
  );
}

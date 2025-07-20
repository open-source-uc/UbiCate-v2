"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import * as Icons from "@/app/components/icons/icons";
import { useSidebar } from "@/app/context/sidebarCtx";
import { SubSidebarType } from "@/utils/types";

import PillFilter from "../pills/PillFilter";
import PlaceMenu from "../placeMenu/placeMenu";
import { SearchDropdown } from "../search/SearchDropdown";

import CampusList from "./campusList";
import FooterOptionsSidebar from "./footerOptionsSidebar";
import NotificationBarDesktop from "./notificationsBarDesktop";

export default function DesktopSidebar() {
  const { isOpen, setIsOpen, selectedPlace, setSelectedPlace, setPlaces } = useSidebar();
  const [activeSubSidebar, setActiveSubSidebar] = useState<SubSidebarType>(null);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  const toggleSubSidebar = (type: SubSidebarType) => {
    setActiveSubSidebar((prev) => (prev === type ? null : type));
  };

  const handleCollapsedClick = (type: SubSidebarType) => {
    toggleSubSidebar(type);
  };

  const handleCampusClick = (campusName: string) => {
    router.push(`/?campus=${campusName}`);
    handleToggleSidebar();
    setActiveSubSidebar(null);
  };

  useEffect(() => {
    if (selectedPlace !== null) {
      setActiveSubSidebar("placeInformation");
    }
    if (selectedPlace === null) {
      setActiveSubSidebar(null);
      setIsOpen(false);
    }
  }, [selectedPlace, setIsOpen]);

  return (
    <>
      {/* Contenedor principal con flex row */}
      <NotificationBarDesktop />
      <div className="flex h-screen">
        {/* Sidebar principal */}
        <section
          className={`bg-background/95 backdrop-blur-sm text-foreground flex flex-col z-40 h-full transition-all duration-200 pb-4 ${
            isOpen ? "w-54" : "w-20"
          }`}
        >
          <div className={`flex items-center p-4 ${isOpen ? "flex-row justify-between" : "flex-col py-8 space-y-6"}`}>
            {/* Logo - visible only when expanded */}
            <Link href="/" className={`${isOpen ? "block" : "hidden"}`}>
              <img src="/long-logo.svg" className="pl-2" alt="Logo" width="118" />
            </Link>

            {/* Toggle button */}
            <div className={`${isOpen ? "" : "flex justify-center"}`}>
              <button onClick={toggleSidebar} className="hover:text-muted pointer-events-auto cursor-pointer">
                <Icons.DockToRight className="w-6 h-6" />
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
                  isOpen ? "w-full p-2 rounded-md hover:bg-secondary" : ""
                } flex items-center pointer-events-auto cursor-pointer ${
                  !isOpen ? "justify-center px-4 py-3" : "space-x-4"
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeSubSidebar === "buscar" ? "bg-primary" : "bg-accent"
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
                  isOpen ? "w-full p-2 rounded-md hover:bg-accent/18" : ""
                } flex items-center pointer-events-auto cursor-pointer ${
                  !isOpen ? "justify-center px-4 py-3" : "space-x-4"
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeSubSidebar === "campus" ? "bg-primary" : "bg-accent"
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
                <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
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
          className={`shadow-lg h-full overflow-hidden bg-background/95 backdrop-blur-sm text-foreground transition-all duration-200 border-l-1 border-border ${
            activeSubSidebar !== null ? "w-96 opacity-100 p-2" : "w-0 opacity-0 p-0"
          }`}
        >
          <div className={`${activeSubSidebar !== null ? "block overflow-auto h-full" : "hidden"}`}>
            {activeSubSidebar === "campus" && (
              <div className="w-full h-full space-y-4">
                <CampusList handleCampusClick={handleCampusClick} setActiveSubSidebar={setActiveSubSidebar} />
              </div>
            )}
            {activeSubSidebar === "guías" && (
              <>
                <h3 className="font-bold text-lg">Guías</h3>
                <ul className="space-y-2">Hello. This is not implemented.</ul>
              </>
            )}
            {activeSubSidebar === "placeInformation" && selectedPlace !== null && (
              <div className="w-full h-full">
                <PlaceMenu
                  place={selectedPlace}
                  onCloseMenu={() => {
                    setSelectedPlace(null);
                    toggleSubSidebar(null);
                  }}
                  onCloseCreate={() => {
                    setSelectedPlace(null);
                    toggleSubSidebar(null);
                    setIsOpen(false);
                  }}
                />
              </div>
            )}
            {activeSubSidebar === "buscar" && (
              <div className="w-full h-full overflow-auto space-y-2">
                <h3 className="font-bold text-lg">Buscar</h3>
                <div className="p-1">
                  <SearchDropdown />
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

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import * as Icons from "@/app/components/icons/icons";
import { useSidebar } from "@/app/context/sidebarCtx";
import { SubSidebarType } from "@/utils/types";

import PlaceMenu from "../../placeMenu/placeMenu";
import CampusList from "../sections/campusList";
import FooterOptionsSidebar from "../sections/footerOptionsSidebar";
import SearchSubsidebar from "../sections/searchSubsidebar";
import DesktopNavigationButton from "../ui/desktopNavigationButton";
import SidebarToggleButton from "../ui/sidebarToggleButton";

import NotificationBarDesktop from "./desktopNotifications";

export default function DesktopSidebar() {
  const { isOpen, setIsOpen, geocoder, selectedPlace, setSelectedPlace } = useSidebar();
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

  const handleSearchSelection = () => {
    handleToggleSidebar();
    setActiveSubSidebar(null);
  };

  const handleCampusClick = (campusName: string) => {
    router.push(`/?campus=${campusName}`);
    handleToggleSidebar();
    setActiveSubSidebar(null);
  };

  // Cuando se selecciona un lugar, muestra "placeInformation"
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
          className={`bg-background/95 backdrop-blur-sm text-foreground flex flex-col z-40 h-full transition-discrete duration-200 pb-4 ${
            isOpen ? "w-54" : "w-20"
          }`}
        >
          <div className={`flex items-center p-4 ${isOpen ? "flex-row justify-between" : "flex-col py-8 space-y-6"}`}>
            {/* Logo - visible solo cuando expandido */}
            <Link href="/" className={`${isOpen ? "block" : "hidden"}`}>
              <img src="/long-logo.svg" className="pl-2" alt="Logo" width="118" />
            </Link>

            {/* Botón para Expandir */}
            <div className={`${isOpen ? "" : "flex justify-center"}`}>
              <SidebarToggleButton onClick={toggleSidebar} />
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1">
            <div className={`${isOpen ? "pt-5 px-4" : ""}`}>
              {/* Botón de Búsqueda */}
              <DesktopNavigationButton
                icon={<Icons.Search />}
                label="Buscar"
                isActive={activeSubSidebar === "buscar"}
                isExpanded={isOpen}
                onClick={() => (isOpen ? toggleSubSidebar("buscar") : handleCollapsedClick("buscar"))}
              />

              {/* Campus button */}
              <DesktopNavigationButton
                icon={<Icons.Map />}
                label="Campus"
                isActive={activeSubSidebar === "campus"}
                isExpanded={isOpen}
                onClick={() => (isOpen ? toggleSubSidebar("campus") : handleCollapsedClick("campus"))}
              />
            </div>
          </nav>

          {/* Footer - Solo visible cuando expandido */}
          <div className={`flex flex-col space-y-4 px-4 ${isOpen ? "block" : "hidden"}`}>
            <FooterOptionsSidebar />
          </div>
        </section>

        {/* Segunda sección - subsidebar */}
        <section
          className={`shadow-lg h-full overflow-hidden bg-background backdrop-blur-sm text-foreground transition-all duration-200 border-l border-border ${
            activeSubSidebar !== null ? "w-96 opacity-100 p-2" : "w-0 opacity-0 p-0"
          }`}
        >
          <div className={`${activeSubSidebar !== null ? "block overflow-auto h-full" : "hidden"}`}>
            {activeSubSidebar === "campus" && (
              <div className="w-full h-full">
                <CampusList handleCampusClick={handleCampusClick} setActiveSubSidebar={setActiveSubSidebar} />
              </div>
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
              <SearchSubsidebar
                geocoder={geocoder}
                setActiveSubSidebar={setActiveSubSidebar}
                onSearchSelection={handleSearchSelection}
              />
            )}
          </div>
        </section>
      </div>
    </>
  );
}

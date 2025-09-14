"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import { NotificationErrorBoundary } from "@/app/components/app/appErrors/NotificationErrorBoundary";
import * as Icons from "@/app/components/ui/icons/icons";
import { Button } from "@/app/components/ui/button";
import { useSidebar } from "@/app/context/sidebarCtx";
import { useTheme } from "@/app/context/themeCtx";
import { SubSidebarType } from "@/lib/types";

import PillFilter from "../../filters/pills/PillFilter";
import PlaceMenu from "../../places/placeMenu/placeMenu";
import { SearchDropdown } from "../../search/SearchDropdown";

import CampusList from "./campusList";
import FooterOptionsSidebar from "./footerOptionsSidebar";
import ThemesList from "./themesList";

export default function DesktopSidebar() {
  const { isOpen, setIsOpen, selectedPlace, setSelectedPlace } = useSidebar();
  const { rotateTheme } = useTheme();
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
      <div className="flex h-screen overflow-y-auto">
        {/* Sidebar principal */}
        <section
          className={`bg-background text-foreground flex flex-col z-40 h-full pb-4 ${
            isOpen ? "w-52" : "w-20"
          }`}
        >
          <div className={`flex items-center p-4 ${isOpen ? "flex-row gap-6" : "flex-col py-8 space-y-6"}`}>
            {/* Logo - visible only when expanded */}
            <Link href="/" className={`${isOpen ? "block opacity-100" : "hidden opacity-0"}`}>
              <img src="/logo.svg" className="pl-2 w-40 h-20" alt="Logo" />
            </Link>

            {/* Toggle button with improved interaction */}
            <div className={`${isOpen ? "h-full flex items-center" : "flex items-center"}`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                icon={<Icons.DockToRight className="w-7 h-7" />}
                className="hover:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <div className={`${isOpen ? "pt-5 px-4" : ""} flex flex-col`}>
              {/* Search button */}
              <Button
                variant="ghost"
                size={isOpen ? "sidebar" : "sidebar-collapsed"}
                onClick={() => (isOpen ? toggleSubSidebar("buscar") : handleCollapsedClick("buscar"))}
                icon={<Icons.Search />}
                text={isOpen ? "Buscar" : undefined}
                isActive={activeSubSidebar === "buscar"}
              />
              {/* Campus button */}
              <Button
                variant="ghost"
                size={isOpen ? "sidebar" : "sidebar-collapsed"}
                onClick={() => (isOpen ? toggleSubSidebar("campus") : handleCollapsedClick("campus"))}
                icon={<Icons.Map />}
                text={isOpen ? "Campus" : undefined}
                isActive={activeSubSidebar === "campus"}
              />
              <Button
                variant="ghost"
                size={isOpen ? "sidebar" : "sidebar-collapsed"}
                onClick={() => (isOpen ? toggleSubSidebar("temas") : handleCollapsedClick("temas"))}
                icon={<Icons.Palette />}
                text={isOpen ? "Temas" : undefined}
                isActive={activeSubSidebar === "temas"}
              />
            </div>
          </nav>

          {/* Footer with improved visibility */}
          <div className={`flex flex-col space-y-4 px-4 ${isOpen ? "opacity-100 block" : "opacity-0 hidden"}`}>
            <FooterOptionsSidebar />
          </div>
          <div className={`flex justify-center ${!isOpen ? "opacity-100 block" : "opacity-0 hidden"}`}>
            <div className="w-10 h-10 rounded-xl bg-primary hover:bg-primary/90">
              <Link 
                href="/creditos" 
                className="font-semibold block hover:underline focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2 focus:ring-offset-primary rounded"
              >
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center`}>
                  <Icons.OSUC />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Segunda sección - subsidebar - always rendered but with dynamic width */}
        <section
          className={`shadow-lg h-full overflow-hidden bg-background/95 backdrop-blur-sm text-foreground border-l border-border ${
            activeSubSidebar !== null ? "w-96 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className={`${activeSubSidebar !== null ? "block h-full" : "hidden"}`}>
            {activeSubSidebar === "campus" && (
              <div className="flex flex-col h-full">
                <CampusList handleCampusClick={handleCampusClick} setActiveSubSidebar={setActiveSubSidebar} />
              </div>
            )}
            {activeSubSidebar === "guías" && (
              <div className="flex flex-col h-full">
                {/* Header following consistent pattern */}
                <div className="flex items-center justify-between w-full px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-foreground">Guías</h3>
                  </div>
                  <button
                    onClick={() => setActiveSubSidebar(null)}
                    className="w-8 h-8 text-foreground bg-accent flex items-center justify-center rounded-full hover:text-accent hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Cerrar menú"
                  >
                    <Icons.Close className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Content area with consistent spacing */}
                <div className="flex-1 px-4">
                  <ul className="space-y-2">Hello. This is not implemented.</ul>
                </div>
              </div>
            )}
            {activeSubSidebar === "placeInformation" && selectedPlace !== null && (
              <div className="flex flex-col h-full">
                <NotificationErrorBoundary>
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
                </NotificationErrorBoundary>
              </div>
            )}
            {activeSubSidebar === "buscar" && (
              <div className="flex flex-col h-full">
                {/* Header following consistent pattern */}
                <div className="flex items-center justify-between w-full px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-foreground">Buscar</h3>
                  </div>
                  <button
                    onClick={() => setActiveSubSidebar(null)}
                    className="w-8 h-8 text-foreground bg-accent flex items-center justify-center rounded-full hover:text-accent hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Cerrar menú"
                  >
                    <Icons.Close className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Content area with consistent spacing */}
                <div className="flex-1 px-4 space-y-4 overflow-auto">
                  <div>
                    <SearchDropdown />
                  </div>
                  <div>
                    <h4 className="font-semibold text-md mb-2">Filtra por lugares</h4>
                    <PillFilter />
                  </div>
                </div>
              </div>
            )}
            {activeSubSidebar === "temas" && (
              <div className="flex flex-col h-full">
                <ThemesList setActiveSubSidebar={setActiveSubSidebar} />
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

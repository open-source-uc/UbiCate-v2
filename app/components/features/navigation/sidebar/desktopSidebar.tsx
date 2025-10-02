"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import { NotificationErrorBoundary } from "@/app/components/app/appErrors/NotificationErrorBoundary";
import { Button } from "@/app/components/ui/button";
import * as Icons from "@/app/components/ui/icons/icons";
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
        <section className={`bg-background text-foreground flex flex-col z-40 h-full pb-4 ${isOpen ? "w-52" : "w-20"}`}>
          <div className={`flex items-center p-4  ${isOpen ? "flex-row gap-6" : "flex-col py-8 space-y-6"}`}>
            {/* Logo - visible only when expanded */}
            <Link href="/" className={`${isOpen ? "block" : "hidden"}`}>
              <img src="/logo.svg" className="pl-2 w-40 h-20" alt="Logo" />
            </Link>

            {/* Toggle button */}
            <div className={`${isOpen ? "h-full flex items-center" : "flex items-center"}`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                icon={<Icons.DockToRight className="w-7 h-7" />}
                className="hover:text-muted"
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

          {/* Footer - visible only when expanded */}
          <div className={`flex flex-col space-y-4 px-4 ${isOpen ? "block" : "hidden"}`}>
            <FooterOptionsSidebar />
          </div>
          <div className={`flex justify-center ${!isOpen ? "block" : "hidden"}`}>
            <div className="w-10 h-10 rounded-xl bg-primary">
              <Link href="/creditos" className="font-semibold block hover:underline">
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center`}>
                  <Icons.OSUC />
                </span>{" "}
              </Link>
            </div>
          </div>
        </section>

        {/* Segunda sección - subsidebar - always rendered but with dynamic width */}
        <section
          className={`shadow-lg h-full overflow-hidden bg-background text-foreground border-l-1 border-border ${
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
                {/* Header */}
                <div className="flex items-center justify-between w-full px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Buscar</h3>
                      <p className="text-xs text-muted-foreground">Encuentra lugares y ubicaciones</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSubSidebar(null)}
                    className="w-8 h-8 bg-primary flex items-center justify-center rounded-full cursor-pointer group hover:bg-secondary transition"
                    aria-label="Cerrar menú"
                  >
                    <Icons.Close className="w-4 h-4 fill-background group-hover:fill-secondary-foreground" />
                  </button>
                </div>

                {/* Search section following sidebar pattern */}
                <section className="flex-1 px-4 pt-4 pb-8 overflow-auto">
                  <div className="flex flex-col gap-4">
                    {/* Search box */}
                    <div className="flex flex-col gap-2">
                      <p className="text-md font-semibold text-foreground">Busca un lugar</p>
                      <div className="bg-secondary rounded-lg p-2">
                        <SearchDropdown />
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-2">
                      <p className="text-md font-semibold text-foreground">Filtra por categoría</p>
                      <div className="bg-secondary rounded-lg p-2">
                        <PillFilter />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
            {activeSubSidebar === "temas" && (
              <div className="w-full h-full space-y-4">
                <ThemesList setActiveSubSidebar={setActiveSubSidebar} />
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

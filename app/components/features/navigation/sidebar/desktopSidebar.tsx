"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { NotificationErrorBoundary } from "@/app/components/app/appErrors/NotificationErrorBoundary";
import { Button } from "@/app/components/ui/button";
import * as Icons from "@/app/components/ui/icons/icons";
import { useMapPicking } from "@/app/context/mapPickingCtx";
import { useSidebar } from "@/app/context/sidebarCtx";
import { useTheme } from "@/app/context/themeCtx";
import { Feature, SubSidebarType } from "@/lib/types";

import PillFilter from "../../filters/pills/PillFilter";
import PlaceMenu from "../../places/placeMenu/placeMenu";
import { SearchDropdown } from "../../search/SearchDropdown";

import CampusList from "./campusList";
import FooterOptionsSidebar from "./footerOptionsSidebar";
import UsageGuide from "./usageGuide";
// import ThemesList from "./themesList";

const SUBSIDEBAR_ANIM_MS = 200;

export default function DesktopSidebar() {
  const { isOpen, setIsOpen, selectedPlace, setSelectedPlace, closeSignal } = useSidebar();
  const { isCreatingPlace } = useMapPicking();
  const { rotateTheme } = useTheme();
  const [activeSubSidebar, setActiveSubSidebar] = useState<SubSidebarType>(null);
  // El contenido sobrevive al cierre lo que dura la animación, para que el panel no se vacíe de golpe.
  const [renderedSubSidebar, setRenderedSubSidebar] = useState<SubSidebarType>(null);
  const router = useRouter();

  useEffect(() => {
    if (activeSubSidebar !== null) {
      setRenderedSubSidebar(activeSubSidebar);
      return;
    }
    const timer = setTimeout(() => setRenderedSubSidebar(null), SUBSIDEBAR_ANIM_MS);
    return () => clearTimeout(timer);
  }, [activeSubSidebar]);

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

  // El panel del lugar se mantiene mientras se esté creando un punto (`isCreatingPlace`): aunque algo
  // deseleccione el lugar, la propuesta solo se descarta con la x del sidebar.
  const lastPlaceRef = useRef<Feature | null>(null);
  useEffect(() => {
    if (selectedPlace !== null) lastPlaceRef.current = selectedPlace;
  }, [selectedPlace]);
  const menuPlace = selectedPlace ?? (isCreatingPlace ? lastPlaceRef.current : null);

  useEffect(() => {
    if (selectedPlace !== null) {
      setActiveSubSidebar("placeInformation");
      return;
    }
    if (isCreatingPlace) return;
    setActiveSubSidebar(null);
    setIsOpen(false);
  }, [selectedPlace, setIsOpen, isCreatingPlace]);

  // Clic en el mapa: cierra el panel abierto sea cual sea (buscar, campus, guía o el lugar). El efecto
  // de arriba no basta: si `selectedPlace` ya era null, no se vuelve a disparar.
  useEffect(() => {
    if (closeSignal === 0 || isCreatingPlace) return;
    setActiveSubSidebar(null);
    setIsOpen(false);
  }, [closeSignal, setIsOpen, isCreatingPlace]);

  return (
    <>
      {/* Contenedor principal con flex row */}
      <div className="flex h-full overflow-y-auto">
        {/* Sidebar principal */}
        <section
          className={`bg-background text-foreground flex flex-col z-40 h-full pb-4 overflow-x-hidden transition-[width] duration-200 ease-out motion-reduce:transition-none ${
            isOpen ? "w-52" : "w-20"
          }`}
        >
          {/* Geometría fija en ambos estados: gutter de 16px y botón de 48px. Colapsado (80px) el botón
              queda centrado y su eje coincide con el de los íconos del nav, así nada se mueve al abrir. */}
          <div className="flex items-center gap-4 p-4">
            {/* Logo - visible only when expanded */}
            <Link href="/" className={`min-w-0 ${isOpen ? "block anim-fade-in" : "hidden"}`}>
              <img src="/logo.svg" className="h-12 w-auto max-w-full object-contain object-left" alt="Logo" />
            </Link>

            {/* Toggle button: ml-auto lo mantiene pegado al borde derecho, así acompaña el ancho en vez
                de saltar cuando aparece el logo. */}
            <div className="ml-auto shrink-0 flex items-center">
              <Button
                variant="ghost-primary"
                size="icon-lg"
                onClick={toggleSidebar}
                icon={<Icons.DockToRight className="w-7 h-7" />}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <div className="flex flex-col gap-2 pt-5 px-3">
              {/* Search button */}
              <Button
                variant="ghost"
                size="sidebar"
                onClick={() => (isOpen ? toggleSubSidebar("buscar") : handleCollapsedClick("buscar"))}
                icon={<Icons.Search />}
                text={isOpen ? "Buscar" : undefined}
                isActive={activeSubSidebar === "buscar"}
              />
              {/* Campus button */}
              <Button
                variant="ghost"
                size="sidebar"
                onClick={() => (isOpen ? toggleSubSidebar("campus") : handleCollapsedClick("campus"))}
                icon={<Icons.Map />}
                text={isOpen ? "Campus" : undefined}
                isActive={activeSubSidebar === "campus"}
              />
              {/* Usage Guide button */}
              <Button
                variant="ghost"
                size="sidebar"
                onClick={() => (isOpen ? toggleSubSidebar("guías") : handleCollapsedClick("guías"))}
                icon={<Icons.Info className="w-6 h-6" />}
                text={isOpen ? "Guía" : undefined}
                isActive={activeSubSidebar === "guías"}
              />
            </div>
          </nav>

          {/* Footer - visible only when expanded */}
          <div className={`flex flex-col space-y-4 px-3 ${isOpen ? "block anim-fade-in" : "hidden"}`}>
            <FooterOptionsSidebar />
          </div>
          <div className={`flex justify-center ${!isOpen ? "block anim-fade-in" : "hidden"}`}>
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
          className={`shadow-lg h-full overflow-hidden bg-background text-foreground border-l-1 border-border transition-[width,opacity,padding] duration-200 ease-out motion-reduce:transition-none ${
            activeSubSidebar !== null ? "w-96 opacity-100 p-2" : "w-0 opacity-0 p-0"
          }`}
          aria-hidden={activeSubSidebar === null}
          inert={activeSubSidebar === null}
        >
          {/* Ancho fijo (w-96 menos el p-2 del padre): así el contenido se revela recortado en vez de
              comprimirse mientras el panel se abre. */}
          <div className="overflow-auto h-full w-[23rem]">
            {renderedSubSidebar === "campus" && (
              <div className="w-full h-full space-y-4">
                <CampusList handleCampusClick={handleCampusClick} setActiveSubSidebar={setActiveSubSidebar} />
              </div>
            )}
            {renderedSubSidebar === "guías" && (
              <div className="w-full h-full">
                <UsageGuide onClose={() => setActiveSubSidebar(null)} />
              </div>
            )}
            {renderedSubSidebar === "placeInformation" && menuPlace !== null && (
              <div className="w-full h-full">
                <NotificationErrorBoundary>
                  <PlaceMenu
                    place={menuPlace}
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
            {renderedSubSidebar === "buscar" && (
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
                <section className="flex-1 px-4 pt-4 pb-8 overflow-auto w-full">
                  <div className="flex flex-col gap-4 w-full">
                    {/* Search box */}
                    <div className="flex flex-col gap-2 w-full">
                      <SearchDropdown />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-2 w-full">
                      <p className="text-md font-semibold text-foreground">Filtra por categoría</p>
                      <PillFilter />
                    </div>
                  </div>
                </section>
              </div>
            )}
            {/* {activeSubSidebar === "temas" && (
              <div className="w-full h-full space-y-4">
                <ThemesList setActiveSubSidebar={setActiveSubSidebar} />
              </div>
            )} */}
          </div>
        </section>
      </div>
    </>
  );
}

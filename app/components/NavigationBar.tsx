"use client";
import "../custom-landing-geocoder.css";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { useSidebar } from "../context/sidebarCtx";
import MenuInformation from "../map/menuInformation";

import PillActionBar from "./pillActionBar";
import PillFilter from "./pillFilterBar";

type SubSidebarType = "buscar" | "campus" | "guías" | "menuInformation" | null;

function DesktopSidebar() {
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
                <span className="material-symbols-outlined self-center">dock_to_right</span>
              </button>
            </div>
            <button
              onClick={() => handleCollapsedClick("buscar")}
              className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center hover:bg-brown-medium pointer-events-auto cursor-pointer"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            <button
              onClick={() => handleCollapsedClick("campus")}
              className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center hover:bg-brown-medium pointer-events-auto cursor-pointer"
            >
              <span className="material-symbols-outlined">map</span>
            </button>
            <button
              disabled
              className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center opacity-50 pointer-events-auto cursor-pointer"
            >
              <span className="material-symbols-outlined">menu_book</span>
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
                <span className="material-symbols-outlined">dock_to_right</span>
              </button>
            </div>
          </div>

          {/* Opciones de navegación */}
          <nav className="flex-1">
            <div className="pt-5 space-y-2 flex flex-col">
              <button
                onClick={() => toggleSubSidebar("buscar")}
                className="w-full flex items-center space-x-4 p-2 rounded-md hover:bg-brown-medium pointer-events-auto cursor-pointer"
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
                      <span className="material-symbols-outlined">map</span>
                    </span>
                    <p className="text-md">Campus</p>
                  </button>
                  <button
                    onClick={() => toggleSubSidebar("guías")}
                    disabled
                    className="w-full flex flex-row items-center justify-start space-x-4 p-2 rounded-md opacity-50"
                  >
                    <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-brown-light">
                      <span className="material-symbols-outlined">menu_book</span>
                    </span>
                    <p className="text-md">Guías</p>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Secciones de Feedback y OSUC */}
          <div className="flex flex-col space-y-4">
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
              <div className="text-xs text-white-blue p-4 mobile:p-3 tablet:p-4">
                Desarrollado por
                <Link href="/creditos" className="font-semibold block hover:underline">
                  Open Source eUC
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Subsidebar (Desktop) integrado */}
        {(isOpen && activeSubSidebar) || activeSubSidebar === "menuInformation" ? (
          <section
            className={`absolute bg-brown-dark/95 backdrop-blur-sm text-white-ubi transform transition-transform duration-300 z-60
            desktop:top-0 desktop:left-full desktop:h-full desktop:w-96 desktop:border-l-1 desktop:border-brown-light
            max-desktop:inset-0 max-desktop:border-t-1 max-desktop:border-brown-light ${
              activeSubSidebar ? "desktop:translate-x-0" : "desktop:translate-x-full"
            } ${activeSubSidebar ? "max-desktop:translate-y-0" : "max-desktop:translate-y-full"}`}
          >
            <div className="py-7 px-4 space-y-6 relative">
              {activeSubSidebar === "buscar" && (
                <>
                  <h3 className="font-bold text-lg">Buscar</h3>
                  <ul className="space-y-8">
                    <section ref={refSearchContainer} />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-md">Filtra por lugares</h4>
                      <PillFilter />
                    </div>
                  </ul>
                </>
              )}
              {activeSubSidebar === "campus" && (
                <>
                  <h3 className="font-bold text-lg">Campus</h3>
                  <div className="w-full grid grid-cols-2 gap-2 tablet:gap-3 desktop:grid-cols-1 desktop:gap-4">
                    {/* Botón Campus San Joaquín */}
                    <button
                      onClick={() => handleCampusClick("SanJoaquin")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("SanJoaquin")}
                      aria-label="Navega a Campus San Joaquín"
                      role="navigation"
                      tabIndex={0}
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      <div className="absolute bottom-0 left-0 p-2 tablet:p-3">
                        <span className="text-white-ubi text-sm tablet:text-md font-semibold" aria-hidden="true">
                          San Joaquín
                        </span>
                      </div>
                    </button>
                    {/* Botón Campus Casa Central */}
                    <button
                      onClick={() => handleCampusClick("CasaCentral")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("CasaCentral")}
                      aria-label="Navega a Campus Casa Central"
                      role="navigation"
                      tabIndex={0}
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      <div className="absolute bottom-0 left-0 p-2 tablet:p-3">
                        <span className="text-white-ubi text-sm tablet:text-md font-semibold" aria-hidden="true">
                          Casa Central
                        </span>
                      </div>
                    </button>
                    {/* Botón Campus Oriente */}
                    <button
                      onClick={() => handleCampusClick("Oriente")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("Oriente")}
                      aria-label="Navega a Campus Oriente"
                      role="navigation"
                      tabIndex={0}
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      <div className="absolute bottom-0 left-0 p-2 tablet:p-3">
                        <span className="text-white-ubi text-sm tablet:text-md font-semibold" aria-hidden="true">
                          Oriente
                        </span>
                      </div>
                    </button>
                    {/* Botón Campus Lo Contador */}
                    <button
                      onClick={() => handleCampusClick("LoContador")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("LoContador")}
                      aria-label="Navega a Campus Lo Contador"
                      role="navigation"
                      tabIndex={0}
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      <div className="absolute bottom-0 left-0 p-2 tablet:p-3">
                        <span className="text-white-ubi text-sm tablet:text-md font-semibold" aria-hidden="true">
                          Lo Contador
                        </span>
                      </div>
                    </button>
                    {/* Botón Campus Villarrica */}
                    <button
                      onClick={() => handleCampusClick("Villarrica")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("Villarrica")}
                      aria-label="Navega a Campus Villarrica"
                      role="navigation"
                      tabIndex={0}
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] col-span-2 md:col-span-1 rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      <div className="absolute bottom-0 left-0 p-2 tablet:p-3">
                        <span className="text-white-ubi text-sm tablet:text-md font-semibold" aria-hidden="true">
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
                    toggleSubSidebar(null);
                  }}
                />
              )}
            </div>
          </section>
        ) : null}
      </section>
    </>
  );
}

function MobileSidebar() {
  const { isOpen, setIsOpen, toggleSidebar, geocoder, selectedPlace, setSelectedPlace } = useSidebar();
  const [activeSubSidebar, setActiveSubSidebar] = useState<SubSidebarType>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number>(10);
  const [enableTransition, setEnableTransition] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const refSearchContainer = useRef<HTMLDivElement | null>(null);
  const dragStartY = useRef<number | null>(null);
  const lastHeight = useRef<number>(10);
  const isDragging = useRef<boolean>(false);

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  const toggleSubSidebar = (type: SubSidebarType) => {
    setActiveSubSidebar((prev) => (prev === type ? null : type));
  };

  const handleSearchSelection = () => {
    handleToggleSidebar();
    setActiveSubSidebar(null);
    const activeElement = document.activeElement as HTMLElement;
    activeElement?.blur();
  };

  const handleCampusClick = (campusName: string) => {
    router.push(`/?campus=${campusName}`);
    handleToggleSidebar();
    setActiveSubSidebar(null);
  };

  // Handlers for drag functionality (desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    lastHeight.current = sidebarHeight;
    isDragging.current = true;
    setEnableTransition(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    if (!isDragging.current || dragStartY.current === null) return;

    const windowHeight = window.innerHeight;
    const dragDelta = dragStartY.current - e.clientY;
    const heightPercentDelta = (dragDelta / windowHeight) * 100;

    const newHeight = Math.max(10, Math.min(100, lastHeight.current + heightPercentDelta));
    setSidebarHeight(newHeight);

    // Ensure sidebar is open when dragging
    if (newHeight > 10 && !isOpen) {
      setIsOpen(true);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    dragStartY.current = null;
    setEnableTransition(true);

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    // Snap to predefined heights
    if (sidebarHeight < 30) {
      setSidebarHeight(10);
      setIsOpen(false);
    } else if (sidebarHeight < 65) {
      setSidebarHeight(45);
      setIsOpen(true);
    } else {
      setSidebarHeight(80);
      setIsOpen(true);
    }
  };

  // Handlers for drag functionality (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    lastHeight.current = sidebarHeight;
    isDragging.current = true;
    setEnableTransition(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || dragStartY.current === null) return;

    const windowHeight = window.innerHeight;
    const dragDelta = dragStartY.current - e.touches[0].clientY;
    const heightPercentDelta = (dragDelta / windowHeight) * 100;

    const newHeight = Math.max(10, Math.min(100, lastHeight.current + heightPercentDelta));
    setSidebarHeight(newHeight);

    // Ensure sidebar is open when dragging
    if (newHeight > 10 && !isOpen) {
      setIsOpen(true);
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    dragStartY.current = null;
    setEnableTransition(true);

    // Snap to heights and handle open/close state
    if (sidebarHeight < 30) {
      setSidebarHeight(10);
      setIsOpen(false);
    } else if (sidebarHeight < 65) {
      setSidebarHeight(45);
      setIsOpen(true);
    } else {
      setSidebarHeight(80);
      setIsOpen(true);
    }
  };

  // Handle click on grab bar when sidebar is closed
  const handleGrabBarClick = () => {
    if (!isOpen) {
      setSidebarHeight(45);
      setIsOpen(true);
    }
  };

  // Handle when a specific place is selected
  useEffect(() => {
    if (selectedPlace !== null) {
      setIsOpen(true);
      setActiveSubSidebar("menuInformation");
      setSidebarHeight(60);
    } else {
      setActiveSubSidebar(null);
      setSidebarHeight(10);
    }
  }, [selectedPlace, setIsOpen]);

  // Set up geocoder
  useEffect(() => {
    let current: null | MapboxGeocoder = null;
    const interval = setInterval(() => {
      if (geocoder.current !== null && refSearchContainer.current !== null) {
        geocoder.current.addTo(refSearchContainer.current);
        clearInterval(interval);
        geocoder.current?.on("result", handleSearchSelection);
        current = geocoder.current;
      }
    }, 100);

    return () => {
      current?.off("result", handleSearchSelection);
      clearInterval(interval);
    };
  }, []);

  // Handle sidebar close
  useEffect(() => {
    if (isOpen === false) {
      setActiveSubSidebar(null);
      setSidebarHeight(10);
    }
  }, [isOpen]);

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <>
      {/* Search Container */}
      <section className="fixed top-0 right-0 w-full justify-center z-50 py-2 px-4 flex flex-col">
        <div ref={refSearchContainer} className="w-full" />
        <div>
          <PillActionBar />
        </div>
      </section>

      {/* Main Sidebar */}
      <section
        className="fixed bg-brown-dark/95 backdrop-blur-sm text-white-ubi z-50 inset-x-0 bottom-0 translate-y-0 rounded-t-lg touch-manipulation"
        style={{
          height: isOpen ? `${sidebarHeight}dvh` : "4rem",
          transition: enableTransition ? "all 300ms" : "none",
        }}
      >
        {/* Drag handle that spans full width */}
        <div
          className="w-full h-7 cursor-grab active:cursor-grabbing 
    flex justify-center items-center rounded-t-lg touch-pan-x"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleGrabBarClick}
        >
          <div className="w-1/4 h-1.5 bg-brown-light rounded-full mx-auto" />
        </div>

        {isOpen ? (
          <div className="flex flex-col flex-1 w-full h-[calc(100%-1.75rem)] overflow-y-auto">
            <div className="px-4 space-y-4">
              <nav className="pb-5">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2">
                    <p className="text-md font-semibold text-white-ubi">Explora</p>
                    <div className="bg-brown-medium flex rounded-lg p-2">
                      <button
                        onClick={() => toggleSubSidebar("campus")}
                        className={`w-full flex flex-col items-center justify-center p-2 rounded-md transition hover:bg-brown-light/18 ${
                          activeSubSidebar === "campus" ? "bg-blue-location" : "bg-transparent"
                        }`}
                      >
                        <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-brown-light">
                          <span className="material-symbols-outlined">map</span>
                        </span>
                        <p className="text-sm tablet:text-md mt-1">Campus</p>
                      </button>
                      <button
                        disabled
                        className="w-full flex flex-col items-center justify-center p-2 rounded-md opacity-50 cursor-not-allowed"
                      >
                        <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-brown-light">
                          <span className="material-symbols-outlined">menu_book</span>
                        </span>
                        <p className="text-sm tablet:text-md mt-1">Guías</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <PillFilter />
                  </div>

                  <div className="flex flex-row gap-4 tablet:gap-4 mobile:gap-2 pb-5">
                    <div className="w-full rounded-xl bg-brown-light p-4 mobile:p-3 tablet:p-4 text-xs text-white-blue">
                      ¿Crees que algo falta?
                      <Link
                        href={`/form-geo/${searchParams.get("campus") ? `?campus=${searchParams.get("campus")}` : ""}`}
                        className="font-semibold block hover:underline"
                      >
                        Ayúdanos agregándolo
                      </Link>
                    </div>
                    <div className="w-full rounded-xl bg-blue-location p-4 mobile:p-3 tablet:p-4 text-xs text-white-blue">
                      Desarrollado por
                      <Link href="/creditos" className="font-semibold block hover:underline">
                        Open Source eUC
                      </Link>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        ) : null}

        {/* Sub Sidebars */}
        {activeSubSidebar ? (
          <section
            className="fixed pb-5 bg-brown-dark/95 backdrop-blur-sm text-white-ubi transform z-60 inset-x-0 bottom-0 translate-y-0 rounded-t-lg"
            style={{
              height: `${sidebarHeight}dvh`,
              transition: enableTransition ? "all 300ms" : "none",
            }}
          >
            {/* Drag handle in subsidebar */}
            <div
              className="w-full h-7 cursor-grab active:cursor-grabbing flex justify-center items-center rounded-t-lg touch-pan-x"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleGrabBarClick}
            >
              <div className="w-1/4 h-1.5 bg-brown-light rounded-full mx-auto" />
            </div>

            <div className="flex flex-col h-full px-4 space-y-4 relative overflow-y-auto pb-17">
              {activeSubSidebar === "campus" && (
                <>
                  <h3 className="font-bold text-lg">Campus</h3>
                  <button
                    onClick={() => setActiveSubSidebar(null)}
                    className="fixed top-2 right-4 text-white-ubi bg-brown-light flex items-center rounded-full hover:text-brown-light hover:bg-brown-medium pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                    aria-label="Cerrar menú"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                  <div className="w-full grid grid-cols-2 gap-2 tablet:gap-3 desktop:grid-cols-1 desktop:gap-4">
                    <button
                      onClick={() => handleCampusClick("SanJoaquin")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("SanJoaquin")}
                      aria-label="Navega a Campus San Joaquín"
                      role="navigation"
                      tabIndex={0}
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      onClick={() => handleCampusClick("CasaCentral")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("CasaCentral")}
                      aria-label="Navega a Campus Casa Central"
                      role="navigation"
                      tabIndex={0}
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      onClick={() => handleCampusClick("Oriente")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("Oriente")}
                      aria-label="Navega a Campus Oriente"
                      role="navigation"
                      tabIndex={0}
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      onClick={() => handleCampusClick("LoContador")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("LoContador")}
                      aria-label="Navega a Campus Lo Contador"
                      role="navigation"
                      tabIndex={0}
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                      onClick={() => handleCampusClick("Villarrica")}
                      onKeyDown={(e) => e.key === "Enter" && handleCampusClick("Villarrica")}
                      aria-label="Navega a Campus Villarrica"
                      role="navigation"
                      tabIndex={0}
                      className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] col-span-2 md:col-span-1 rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
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
                    toggleSubSidebar(null);
                    setIsOpen(false);
                  }}
                  onEdit={() => {
                    setSidebarHeight(100);
                  }}
                  onCloseEdit={() => {
                    setSidebarHeight(60);
                  }}
                />
              )}
            </div>
          </section>
        ) : null}
      </section>
    </>
  );
}

export default function Sidebar() {
  return (
    <>
      {/* Desktop */}
      <aside className="max-desktop:hidden">
        <DesktopSidebar />
      </aside>
      {/* Mobile & Tablet */}
      <footer className="desktop:hidden">
        <MobileSidebar />
      </footer>
    </>
  );
}

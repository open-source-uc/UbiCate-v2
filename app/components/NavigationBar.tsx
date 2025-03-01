"use client";
import "../custom-landing-geocoder.css";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { useSidebar } from "../context/sidebarCtx";
import MenuInformation from "../map/menuInformation";

import PillFilter from "./pillFilter";

type SubSidebarType = "buscar" | "campus" | "guías" | "menuInformation" | null;

export function DesktopSidebar() {
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
                      <PillFilter setFilteredPlaces={setPlaces} />
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
export function MobileSidebar() {
  const { isOpen, setIsOpen, toggleSidebar, geocoder, setPlaces, selectedPlace, setSelectedPlace } = useSidebar();
  const [activeSubSidebar, setActiveSubSidebar] = useState<SubSidebarType>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number>(18);
  const [enableTransition, setEnableTransition] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const refSearchContainer = useRef<HTMLDivElement | null>(null);
  const dragStartY = useRef<number | null>(null);
  const lastHeight = useRef<number>(18);
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

  // Handle mouse down para desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    lastHeight.current = sidebarHeight;
    isDragging.current = true;
    setEnableTransition(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle mouse move para desktop
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || dragStartY.current === null) return;

    const windowHeight = document.documentElement.clientHeight;
    const dragDelta = dragStartY.current - e.clientY;
    const heightPercentDelta = (dragDelta / windowHeight) * 100;

    let newHeight = Math.max(18, Math.min(100, lastHeight.current + heightPercentDelta));
    setSidebarHeight(newHeight);
  };

  // Handle mouse up para desktop
  const handleMouseUp = () => {
    isDragging.current = false;
    dragStartY.current = null;
    setEnableTransition(true);

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    if (sidebarHeight < 45) {
      setSidebarHeight(18);
    } else if (sidebarHeight < 80) {
      setSidebarHeight(45);
    } else {
      setSidebarHeight(100);
    }
  };

  // Handle touch start para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    lastHeight.current = sidebarHeight;
    isDragging.current = true;
    setEnableTransition(false);
  };

  // Handle touch move para mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || dragStartY.current === null) return;

    const windowHeight = document.documentElement.clientHeight;
    const dragDelta = dragStartY.current - e.touches[0].clientY;
    const heightPercentDelta = (dragDelta / windowHeight) * 100;

    let newHeight = Math.max(18, Math.min(100, lastHeight.current + heightPercentDelta));
    setSidebarHeight(newHeight);
  };

  // Handle touch end para mobile
  const handleTouchEnd = () => {
    isDragging.current = false;
    dragStartY.current = null;
    setEnableTransition(true);

    if (sidebarHeight < 40) {
      setSidebarHeight(18);
    } else if (sidebarHeight > 39 && sidebarHeight < 60) {
      setSidebarHeight(45);
    } else {
      setSidebarHeight(100);
    }
  };

  useEffect(() => {
    if (selectedPlace !== null) {
      setIsOpen(true);
      setActiveSubSidebar("menuInformation");
      setSidebarHeight(45);
    }
    if (selectedPlace === null) {
      setActiveSubSidebar(null);
      setSidebarHeight(18);
    }
  }, [selectedPlace, setIsOpen]);

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

  useEffect(() => {
    if (isOpen === false) {
      setActiveSubSidebar(null);
      setSidebarHeight(18);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const calculatedHeight = isOpen ? `${sidebarHeight}dvh` : "h-28";

  return (
    <>
      <section
        className={`fixed bg-brown-dark/95 backdrop-blur-sm text-white-ubi z-50 inset-x-0 bottom-0 ${
          isOpen ? `${calculatedHeight} translate-y-0` : "h-28 translate-y-0"
        }`}
        style={{
          height: `${sidebarHeight}dvh`,
          transition: enableTransition ? "all 300ms" : "none",
        }}
      >
        <div className="flex flex-col h-full">
          <div
            className="w-full h-5 flex justify-center items-center"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              if (!isOpen) {
                setSidebarHeight(45);
                handleToggleSidebar();
              }
            }}
          >
            <div className="w-1/4 h-1.5 bg-brown-medium rounded-full mx-auto mt-2 cursor-grab active:cursor-grabbing" />
          </div>

          <div className="flex items-center py-2 px-4 gap-2 flex-col space-y-2">
            <section
              ref={refSearchContainer}
              onClick={() => {
                if (!isOpen) {
                  setSidebarHeight(45);
                  handleToggleSidebar();
                }
              }}
              className="flex justify-center w-full"
            />
          </div>
          <div className="flex flex-col flex-1 py-2 px-4 space-y-4 overflow-y-auto">
            <nav>
              <div className="pt-2 space-y-2 flex flex-col">
                <div className="flex flex-1 flex-col space-y-2">
                  <p className="text-md font-semibold text-white-ubi">Explora</p>
                  <div className="bg-brown-medium flex flex-1 rounded-lg p-2 mb-2">
                    <button
                      onClick={() => toggleSubSidebar("campus")}
                      className="w-full flex flex-col items-center justify-center p-2 rounded-md hover:bg-brown-light/18 pointer-events-auto cursor-pointer"
                    >
                      <span
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activeSubSidebar === "campus" ? "bg-blue-location" : "bg-brown-light"
                        }`}
                      >
                        <span className="material-symbols-outlined">map</span>
                      </span>
                      <p className="text-sm tablet:text-md mt-1">Campus</p>
                    </button>
                    <button
                      onClick={() => toggleSubSidebar("guías")}
                      disabled
                      className="w-full flex flex-col items-center justify-center p-2 rounded-md opacity-50"
                    >
                      <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-brown-light">
                        <span className="material-symbols-outlined">menu_book</span>
                      </span>
                      <p className="text-sm tablet:text-md mt-1">Guías</p>
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            <div className="flex flex-row gap-4 tablet:gap-4 mobile:gap-2">
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
                  <Link href="/creditos" className="font-semibold block hover:underline">
                    Open Source eUC
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {activeSubSidebar !== null || activeSubSidebar === "menuInformation" ? (
          <section
            className={`fixed bg-brown-dark/95 backdrop-blur-sm text-white-ubi transform z-60 inset-x-0 bottom-0 ${`${calculatedHeight} translate-y-0`}"
              }`}
            style={{
              height: `${sidebarHeight}dvh`,
              transition: enableTransition ? "all 300ms" : "none",
            }}
          >
            <div className="flex flex-col h-full py-5 px-4 space-y-4 relative overflow-y-auto">
              {activeSubSidebar === "campus" && (
                <>
                  <h3 className="font-bold text-lg">Campus</h3>
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
                  }}
                  onEdit={(isEdit) => {
                    if (isEdit) {
                      setSidebarHeight(100);
                    }
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

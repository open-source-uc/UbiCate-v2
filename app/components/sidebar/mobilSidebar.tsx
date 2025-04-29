"use client";
import "@/app/custom-landing-geocoder.css";

import { useRouter } from "next/navigation";

import { useCallback, useEffect, useRef, useState } from "react";

import { SubSidebarType } from "@/utils/types";

import { useDirections } from "../../context/directionsCtx";
import { useSidebar } from "../../context/sidebarCtx";
import * as Icons from "../icons/icons";
import PillFilter from "../pills/pillFilterBar";
import PlaceInformation from "../placeMenu/placeInfo";

import CampusList from "./campusList";
import FooterOptionsSidebar from "./footerOptionsSidebar";
import PlaceMenu from "../placeMenu/placeMenu";

export default function MobileSidebar() {
  const { isOpen, setIsOpen, geocoder, selectedPlace, setSelectedPlace } = useSidebar();
  const [activeSubSidebar, setActiveSubSidebar] = useState<SubSidebarType>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number>(10);
  const [enableTransition, setEnableTransition] = useState(true);
  const router = useRouter();
  const refSearchContainer = useRef<HTMLDivElement | null>(null);
  const dragStartY = useRef<number | null>(null);
  const lastHeight = useRef<number>(10);
  const isDragging = useRef<boolean>(false);
  const { setDirectionData, duration, distance } = useDirections();

  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen);
  }, [setIsOpen, isOpen]);
  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const toggleSubSidebar = (type: SubSidebarType) => {
    setActiveSubSidebar((prev) => (prev === type ? null : type));
  };

  const handleSearchSelection = useCallback(() => {
    handleToggleSidebar();
    setActiveSubSidebar(null);
    const activeElement = document.activeElement as HTMLElement;
    activeElement?.blur();
  }, [setActiveSubSidebar, handleToggleSidebar]);

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

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
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
    },
    [isOpen, setIsOpen],
  );

  const handleMouseUp = useCallback(() => {
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
  }, [handleMouseMove, setIsOpen, sidebarHeight]);

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
      setActiveSubSidebar("placeInformation");
      setIsOpen(true);
      setSidebarHeight(45);
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
  }, [handleMouseMove, handleMouseUp]);

  return (
    <>
      {/* Search Container */}
      <section className="fixed top-0 right-0 w-full justify-center z-50 py-2 px-4 flex flex-col">
        <div ref={refSearchContainer} className="w-full" />
        {duration && distance ? (
          <div
            className="
      w-full pointer-events-auto cursor-pointer transition-colors duration-200
      flex items-center justify-start gap-3 px-4 py-3 mt-2
      rounded-lg bg-brown-medium hover:bg-brown-light
    "
          >
            <div
              className="
        flex items-center justify-center
        min-w-[28px] min-h-[28px] desktop:min-w-[32px] desktop:min-h-[32px]
        bg-blue-location rounded-md
      "
            >
              <Icons.Directions className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium whitespace-normal break-words desktop:text-base desktop:font-normal text-white">
              Ruta de <span className="font-bold">{distance}</span> metros.
            </span>
            <div className="ml-auto flex-shrink-0">
              <button
                onClick={(e) => setDirectionData(null, null, null)}
                className="text-white-ubi bg-brown-light flex items-center rounded-full hover:text-brown-light hover:bg-brown-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
                aria-label="Cerrar menú"
              >
                <Icons.Close />
              </button>
            </div>
          </div>
        ) : null}
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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-md font-semibold text-white-ubi">Explora</p>
                    <div className="bg-brown-medium flex rounded-lg p-2">
                      <button
                        onClick={() => toggleSubSidebar("campus")}
                        className={`w-full flex flex-col items-center justify-center p-2 rounded-md transition hover:bg-brown-light/18 ${activeSubSidebar === "campus" ? "bg-blue-location" : "bg-transparent"
                          }`}
                      >
                        <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-brown-light">
                          <Icons.Map />
                        </span>
                        <p className="text-sm tablet:text-md mt-1">Campus</p>
                      </button>
                      <button
                        disabled
                        className="w-full flex flex-col items-center justify-center p-2 rounded-md opacity-50 cursor-not-allowed"
                      >
                        <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-brown-light">
                          <Icons.MenuBook />
                        </span>
                        <p className="text-sm tablet:text-md mt-1">Guías</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <PillFilter />
                  </div>

                  <div className="flex flex-row gap-2 pb-5 pt-4">
                    <FooterOptionsSidebar />
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
                <CampusList handleCampusClick={handleCampusClick} setActiveSubSidebar={setActiveSubSidebar} />
              )}
              {activeSubSidebar === "guías" && (
                <>
                  <h3 className="font-bold text-lg">Guías</h3>
                  <ul className="space-y-2">Hello. This is not implemented.</ul>
                </>
              )}
              {activeSubSidebar === "placeInformation" && selectedPlace !== null && (
                <PlaceMenu
                  place={selectedPlace}
                  onCloseMenu={() => {
                    setSelectedPlace(null);
                    toggleSubSidebar(null);
                    setIsOpen(false);
                  }}
                  onOpenCreate={() => {
                    setSidebarHeight(100);
                  }}
                  onCloseCreate={() => {
                    setSidebarHeight(40);
                  }}
                  onOpenEdit={() => {
                    setSidebarHeight(40);
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

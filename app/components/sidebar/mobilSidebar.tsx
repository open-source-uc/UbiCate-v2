"use client";

import { useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import * as Icons from "@/app/components/icons/icons";
import { useSidebar } from "@/app/context/sidebarCtx";
import { useTimeoutManager } from "@/app/hooks/useTimeoutManager";
import { SubSidebarType } from "@/utils/types";

import PillFilter from "../pills/PillFilter";
import PlaceMenu from "../placeMenu/placeMenu";

import CampusList from "./campusList";
import FooterOptionsSidebar from "./footerOptionsSidebar";
import ThemesList from "./themesList";
import TopMobileSidebar from "./topMobilSidebar";

export default function MobileSidebar() {
  const { isOpen, setIsOpen, selectedPlace, setSelectedPlace } = useSidebar();
  const [activeSubSidebar, setActiveSubSidebar] = useState<SubSidebarType>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number>(10);
  const [enableTransition, setEnableTransition] = useState(true);
  const { create } = useTimeoutManager();
  const router = useRouter();
  const dragStartY = useRef<number | null>(null);
  const lastHeight = useRef<number>(10);
  const isDragging = useRef<boolean>(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  const toggleSubSidebar = (type: SubSidebarType) => {
    setActiveSubSidebar((prev) => (prev === type ? null : type));
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
      setActiveSubSidebar("placeInformation");
      setSidebarHeight(33);
    } else {
      setActiveSubSidebar(null);
      setSidebarHeight(10);
    }
  }, [selectedPlace, setIsOpen]);

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

  useEffect(() => {
    const firstTime = !sessionStorage.getItem("first_2131321");
    if (firstTime) {
      create(
        "firstTime",
        () => {
          sessionStorage.setItem("first_2131321", "true");
          setSidebarHeight(45);
          setIsOpen(true);
        },
        50,
      );
    }
  }, []);

  return (
    <>
      {/* Search Container */}
      <TopMobileSidebar />

      {/* Main Sidebar */}
      <section
        className="fixed bg-background/95 backdrop-blur-sm text-foreground z-50 inset-x-0 bottom-0 translate-y-0 rounded-t-lg touch-pan-x"
        style={{
          height: isOpen ? `${sidebarHeight}dvh` : "3rem",
          transition: enableTransition ? "all 300ms" : "none",
        }}
        aria-expanded={isOpen}
        role="dialog"
        aria-label="Mobile Navigation"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleGrabBarClick}
      >
        {/* Drag handle that spans full width */}
        <div
          className="w-full h-7 cursor-grab active:cursor-grabbing 
    flex justify-center items-center rounded-t-lg touch-pan-x"
          role="button"
          aria-label="Drag to resize sidebar"
          tabIndex={0}
        >
          <div className="w-2/5 h-2 bg-muted rounded-full mx-auto" />
        </div>

        {isOpen ? (
          <div className="flex flex-col flex-1 w-full h-[calc(100%-1.75rem)] overflow-y-auto">
            <div className="px-4 space-y-4">
              <nav className="pb-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-md font-semibold text-foreground">Explora</p>
                    <div className="bg-secondary flex rounded-lg p-2">
                      <button
                        onClick={() => toggleSubSidebar("campus")}
                        className={`w-full flex flex-col items-center justify-center p-2 rounded-md transition hover:bg-accent/18 ${
                          activeSubSidebar === "campus" ? "bg-primary" : "bg-transparent"
                        }`}
                        aria-pressed={activeSubSidebar === "campus"}
                      >
                        <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                          <Icons.Map />
                        </span>
                        <p className="text-sm tablet:text-md mt-1">Campus</p>
                      </button>
                      <button
                        onClick={() => toggleSubSidebar("temas")}
                        className={`w-full flex flex-col items-center justify-center p-2 rounded-md transition hover:bg-accent/18 ${
                          activeSubSidebar === "temas" ? "bg-primary" : "bg-transparent"
                        }`}
                        aria-pressed={activeSubSidebar === "temas"}
                      >
                        <span
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            activeSubSidebar === "temas" ? "bg-primary" : "bg-accent"
                          }`}
                        >
                          <Icons.Brush />
                        </span>
                        <span className="text-sm tablet:text-md mt-1">Temas</span>
                      </button>
                      <button
                        disabled
                        className="w-full flex flex-col items-center justify-center p-2 rounded-md opacity-50 cursor-not-allowed"
                        aria-disabled="true"
                      >
                        <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                          <Icons.MenuBook />
                        </span>
                        <p className="text-sm tablet:text-md mt-1">Guías</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <PillFilter />
                  </div>

                  <div className="flex flex-row gap-2 pb-5">
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
            className="fixed pb-5 bg-background/95 backdrop-blur-sm text-foreground transform z-[60] inset-x-0 bottom-0 translate-y-0 rounded-t-lg"
            style={{
              height: `${sidebarHeight}dvh`,
              transition: enableTransition ? "all 300ms" : "none",
            }}
            role="region"
            aria-label={`${activeSubSidebar} panel`}
          >
            {/* Drag handle in subsidebar */}
            <div
              className="w-full h-7 cursor-grab active:cursor-grabbing flex justify-center items-center rounded-t-lg touch-pan-x"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleGrabBarClick}
              role="button"
              aria-label="Drag to resize sidebar"
              tabIndex={0}
            >
              <div className="w-1/4 h-1.5 bg-muted rounded-full mx-auto" />
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
              {activeSubSidebar === "temas" && (
                <div className="w-full h-full space-y-4">
                  <ThemesList setActiveSubSidebar={setActiveSubSidebar} />
                </div>
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
                  onOpenEdit={() => {
                    setSidebarHeight(40);
                  }}
                  onCloseCreate={() => {
                    setSelectedPlace(null);
                    toggleSubSidebar(null);
                    setIsOpen(false);
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

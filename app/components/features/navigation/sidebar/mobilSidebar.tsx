"use client";

import { useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { NotificationErrorBoundary } from "@/app/components/app/appErrors/NotificationErrorBoundary";
import * as Icons from "@/app/components/ui/icons/icons";
import { useSidebar } from "@/app/context/sidebarCtx";
import { useTimeoutManager } from "@/app/hooks/useTimeoutManager";
import { SubSidebarType } from "@/lib/types";

import PillFilter from "../../filters/pills/PillFilter";
import PlaceMenu from "../../places/placeMenu/placeMenu";

import CampusList from "./campusList";
import FooterOptionsSidebar from "./footerOptionsSidebar";
import ThemesList from "./themesList";

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

  // Update CSS custom property for attribution positioning
  useEffect(() => {
    const sidebarHeightRem = isOpen ? Math.max(4, ((sidebarHeight / 100) * window.innerHeight) / 16) : 4;
    // Add extra space for user location buttons (bottom-17 = ~4.25rem + button height + padding ≈ 5rem total)
    document.documentElement.style.setProperty("--mobile-sidebar-height", `${Math.max(sidebarHeightRem, 4.5)}rem`);

    // Hide attribution as soon as sidebar is opened and expanding beyond collapsed state
    const isExpanded = isOpen && sidebarHeight > 10; // Hide when above minimum collapsed height (10%)
    document.documentElement.style.setProperty("--mobile-sidebar-expanded", isExpanded ? "1" : "0");

    // Also add/remove a CSS class for more reliable styling
    if (isExpanded) {
      document.documentElement.classList.add("mobile-sidebar-expanded");
    } else {
      document.documentElement.classList.remove("mobile-sidebar-expanded");
    }
  }, [isOpen, sidebarHeight]);

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const firstTime = !sessionStorage.getItem("first_2131321");
        if (firstTime) {
          create(
            "firstTime",
            () => {
              try {
                sessionStorage.setItem("first_2131321", "true");
              } catch (storageError) {
                console.warn("Unable to set sessionStorage:", storageError);
              }
              setSidebarHeight(45);
              setIsOpen(true);
            },
            50,
          );
        }
      }
    } catch (error) {
      console.warn("Unable to access sessionStorage:", error);
    }
  }, []);

  return (
    <>
      {/* Main Sidebar */}
      <section
        className="fixed shadow-xl outline-1 outline-border bg-background text-foreground z-50 inset-x-0 bottom-0 translate-y-0 rounded-t-2xl touch-manipulation"
        style={{
          height: isOpen ? `${sidebarHeight}dvh` : "4rem",
          transition: enableTransition ? "all 300ms" : "none",
        }}
        aria-expanded={isOpen}
        role="dialog"
        aria-label="Panel de navegación móvil"
      >
        {/* Drag handle that spans full width */}
        <div
          className={`w-full ${isOpen ? "h-8" : "h-16"} cursor-grab active:cursor-grabbing 
    flex justify-center items-start pt-3 rounded-t-lg touch-pan-x`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleGrabBarClick}
          role="button"
          aria-label="Arrastrar para redimensionar el panel"
          tabIndex={0}
        >
          <div className="w-1/5 h-2 bg-primary rounded-full mx-auto" />
        </div>

        {isOpen ? (
          <div
            className="flex flex-col flex-1 w-full h-[calc(100%-1.75rem)] overflow-y-auto"
            aria-hidden={!isOpen}
            {...(isOpen ? {} : { inert: "" as any })}
          >
            <div className="p-4 space-y-4">
              <nav className="pb-5">
                <div className="flex flex-col gap-4">
                  <section className="flex flex-col gap-2">
                    <div className="bg-primary text-background flex rounded-md p-2">
                      <button
                        onClick={() => toggleSubSidebar("campus")}
                        className={`w-full flex flex-col items-center justify-center p-2 rounded-sm transition group hover:bg-accent/15 cursor-pointer ${
                          activeSubSidebar === "campus" ? "bg-primary" : "bg-transparent"
                        }`}
                        aria-pressed={activeSubSidebar === "campus"}
                        tabIndex={isOpen ? 0 : -1}
                      >
                        <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-background group-hover:bg-secondary transition">
                          <Icons.Map className="group-hover:fill-secondary-foreground transition"/>
                        </span>
                        <p className="text-sm tablet:text-md mt-1">Campus</p>
                      </button>
                      <button
                        onClick={() => toggleSubSidebar("temas")}
                        className={`w-full flex flex-col items-center justify-center p-2 rounded-sm transition group hover:bg-accent/15 cursor-pointer ${
                          activeSubSidebar === "temas" ? "bg-primary" : "bg-transparent"
                        }`}
                        aria-pressed={activeSubSidebar === "temas"}
                        tabIndex={isOpen ? 0 : -1}
                      >
                         <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-background group-hover:bg-secondary transition">
                          <Icons.Palette className="group-hover:fill-secondary-foreground transition"/>
                        </span>
                        <span className="text-sm tablet:text-md mt-1">Temas</span>
                      </button>
                    </div>
                  </section>

                  <section>
                      <PillFilter />
                  </section>

                  <section className="flex flex-row gap-2 pb-5">
                    <FooterOptionsSidebar />
                  </section>
                </div>
              </nav>
            </div>
          </div>
        ) : null}

        {/* Sub Sidebars */}
        {activeSubSidebar ? (
          <section
            className="fixed pb-5 bg-background text-foreground transform z-[60] inset-x-0 bottom-0 translate-y-0 rounded-t-lg"
            style={{
              height: `${sidebarHeight}dvh`,
              transition: enableTransition ? "all 300ms" : "none",
            }}
            role="region"
            aria-label={`Panel de ${
              activeSubSidebar === "campus"
                ? "campus"
                : activeSubSidebar === "temas"
                ? "temas"
                : activeSubSidebar === "placeInformation"
                ? "información del lugar"
                : activeSubSidebar
            }`}
            aria-hidden={!activeSubSidebar}
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
              aria-label="Arrastrar para redimensionar el panel"
              tabIndex={activeSubSidebar ? 0 : -1}
            >
              <div className="w-1/4 h-1.5 bg-muted rounded-full mx-auto" />
            </div>

            <div
              className="flex flex-col h-full px-4 space-y-4 relative overflow-y-auto pb-17"
              {...(activeSubSidebar ? {} : { inert: "" as any })}
            >
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
                <NotificationErrorBoundary>
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
                </NotificationErrorBoundary>
              )}
            </div>
          </section>
        ) : null}
      </section>
    </>
  );
}

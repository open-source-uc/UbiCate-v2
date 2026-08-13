"use client";

import { useSyncExternalStore } from "react";

import { NotificationErrorBoundary } from "@/app/components/app/appErrors/NotificationErrorBoundary";
import { useMapPicking } from "@/app/context/mapPickingCtx";
import { useHasHydrated } from "@/app/hooks/useHasHydrated";

import DesktopSidebar from "./desktopSidebar";
import MobileSidebar from "./mobilSidebar";
import NotificationBarDesktop from "./notificationsBarDesktop";
import TopMobileSidebar from "./topMobilSidebar";

// El breakpoint es estado externo del navegador, así que va por useSyncExternalStore en vez de
// copiarse a useState desde un efecto. matchMedia notifica solo cuando se cruza el umbral, a
// diferencia del listener de `resize`, que disparaba en cada pixel.
const DESKTOP_QUERY = "(min-width: 1154px)";

function subscribeToBreakpoint(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getIsDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;
// En el servidor no hay viewport; `useHasHydrated` evita pintar la variante equivocada.
const getIsDesktopOnServer = () => false;

export default function Sidebar() {
  const isDesktop = useSyncExternalStore(subscribeToBreakpoint, getIsDesktop, getIsDesktopOnServer);
  const hasHydrated = useHasHydrated();
  const { isPicking } = useMapPicking();

  if (!hasHydrated) {
    return null;
  }

  return (
    <div className={isPicking ? "hidden" : "contents"}>
      {isDesktop ? (
        <aside className="absolute left-0 top-0 h-full z-50">
          <NotificationBarDesktop />
          <NotificationErrorBoundary>
            <DesktopSidebar />
          </NotificationErrorBoundary>
        </aside>
      ) : (
        <>
          <TopMobileSidebar />
          <footer>
            <NotificationErrorBoundary>
              <MobileSidebar />
            </NotificationErrorBoundary>
          </footer>
        </>
      )}
    </div>
  );
}

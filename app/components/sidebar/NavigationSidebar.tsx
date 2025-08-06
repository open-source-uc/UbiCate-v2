"use client";

import { useEffect, useState } from "react";

import { NotificationErrorBoundary } from "../appErrors/NotificationErrorBoundary";

import DesktopSidebar from "./desktopSidebar";
import MobileSidebar from "./mobilSidebar";
import NotificationBarDesktop from "./notificationsBarDesktop";
import TopMobileSidebar from "./topMobilSidebar";

export default function Sidebar() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1154);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {isDesktop ? (
        <aside>
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
    </>
  );
}

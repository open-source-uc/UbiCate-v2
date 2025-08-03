"use client";

import { useEffect, useState } from "react";

import DesktopSidebar from "./desktopSidebar";
import MobileSidebar from "./mobilSidebar";

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
          <DesktopSidebar />
        </aside>
      ) : (
        <footer>
          <MobileSidebar />
        </footer>
      )}
    </>
  );
}

"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Registered Service Worker:", registration);
          })
          .catch((error) => {
            console.error("An error ocurred while registering the Service Worker:", error);
          });
      });
    }
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    const addManifestLink = () => {
      const existingManifest = document.querySelector('link[rel="manifest"]');

      if (!existingManifest) {
        const manifestLink = document.createElement("link");
        manifestLink.rel = "manifest";
        manifestLink.href = "/manifest.webmanifest";
        document.head.appendChild(manifestLink);
        console.log("Manifest link added to head");
      } else {
        console.log("Manifest link already exists");
      }
    };

    // Registrar Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Registered Service Worker:", registration);
          })
          .catch((error) => {
            console.error("An error occurred while registering the Service Worker:", error);
          });
      });
    }

    // Agregar manifest link
    addManifestLink();
  }, []);

  return null;
}

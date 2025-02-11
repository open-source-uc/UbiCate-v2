"use client";

import { useEffect, useRef } from "react";

import "../custom-landing-geocoder.css";
import { useSidebar } from "../context/sidebarCtx";
import useGeocoder from "../hooks/useGeocoder";

export default function LandingSearch() {
  const geocoderContainer = useRef<HTMLDivElement>(null);
  const fun = useRef<null>(null);
  const { refFunctionClickOnResult } = useSidebar();

  // Poner la funcion por defecto del serachbox de la sidebar
  useEffect(() => {
    refFunctionClickOnResult.current = null;
  }, [refFunctionClickOnResult]);

  useGeocoder(geocoderContainer, fun);

  return (
    <div className="flex justify-center w-full">
      <section
        ref={geocoderContainer}
        className="flex justify-center w-full sm:w-4/6 md:w-5/12 xl:w-4/12 align-middle mapbox-gl-geocoder-theme-borderless"
      />
    </div>
  );
}

"use client";
import { useRef } from "react";

import "../custom-landing-geocoder.css";

export default function LandingSearch() {
  const geocoderContainer = useRef<HTMLDivElement>(null);


  return (
    <section ref={geocoderContainer} className="flex justify-center align-middle mapbox-gl-geocoder-theme-borderless" />
  );
}

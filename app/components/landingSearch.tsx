"use client";
import { useRef } from "react";

import "../custom-landing-geocoder.css";

export default function LandingSearch() {
  const geocoderContainer = useRef<HTMLDivElement>(null);


  return (
    <div className="flex justify-center w-full">
      <section
        ref={geocoderContainer}
        className="flex justify-center w-full sm:w-4/6 md:w-5/12 align-middle mapbox-gl-geocoder-theme-borderless"
      />
    </div>
  );
}

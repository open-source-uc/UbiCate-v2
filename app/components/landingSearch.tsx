"use client";
import { useRouter } from "next/navigation";

import { useRef } from "react";

import "../custom-landing-geocoder.css";
import useGeocoder from "../hooks/useGeocoder";

export default function LandingSearch() {
  const geocoderContainer = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useGeocoder(geocoderContainer, (place) => {
    router.push("/map?place=" + place.properties.identifier);
  });

  return (
    <div className="flex justify-center w-full">
      <section
        ref={geocoderContainer}
        className="flex justify-center w-full sm:w-4/6 md:w-5/12 xl:w-4/12 align-middle mapbox-gl-geocoder-theme-borderless"
      />
    </div>
  );
}

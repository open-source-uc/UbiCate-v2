"use client";
import { useRouter } from "next/navigation";

import { useRef, useEffect } from "react";

import "../custom-landing-geocoder.css";

import geojson from "../../data/places.json";

const loadGeocoder = () => import("@/utils/getGeocoder");

export default function LandingSearch() {
  const geocoderContainer = useRef<HTMLDivElement>(null);
  const geocoder = useRef<any>(null);

  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const initializeGeocoder = async () => {
      const { default: getGeocoder } = await loadGeocoder();

      if (!mounted) return;
      geocoder.current = getGeocoder();

      const redirectToMap = (selectedPlaceId: string) => {
        router.push("/map?place=" + selectedPlaceId);
      };

      geocoder.current.on("result", function (result: any) {
        if (!mounted) return;
        const selectedPlaceId = result.result.properties.identifier;

        for (const place of geojson.features) {
          if (place.properties.identifier === selectedPlaceId) {
            redirectToMap(selectedPlaceId);
            break;
          }
        }
      });

      geocoderContainer.current?.appendChild(geocoder.current.onAdd());
    };

    initializeGeocoder();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <section ref={geocoderContainer} className="flex justify-center align-middle mapbox-gl-geocoder-theme-borderless" />
  );
}

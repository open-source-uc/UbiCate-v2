"use client";
import { useRouter } from "next/navigation";

import { useRef, useEffect } from "react";

import "../custom-landing-geocoder.css";

import geojson from "../../data/places.json";
import { useSearchResultCtx } from "../context/searchResultCtx";

const loadGeocoder = () => import("@/utils/getGeocoder");

export default function LandingSearch() {
  const geocoderContainer = useRef<HTMLDivElement>(null);
  const geocoder = useRef<any>(null);
  const { setSearchResult, setInitialLat, setInitialLng } = useSearchResultCtx();

  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const initializeGeocoder = async () => {
      const { default: getGeocoder } = await loadGeocoder();

      if (!mounted) return;
      geocoder.current = getGeocoder();

      const redirectToMap = () => {
        router.push("/map");
      };

      geocoder.current.on("result", function (result: any) {
        if (!mounted) return;
        const selectedPlaceId = result.result.properties.identifier;

        for (const place of geojson.features) {
          if (place.properties.identifier === selectedPlaceId) {
            setSearchResult(result.result.properties.identifier);
            setInitialLng(result.result.geometry.coordinates[0]);
            setInitialLat(result.result.geometry.coordinates[1]);
            redirectToMap();
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
  }, [router, setInitialLat, setInitialLng, setSearchResult]);

  return (
    <section ref={geocoderContainer} className="flex justify-center align-middle mapbox-gl-geocoder-theme-borderless" />
  );
}

"use client";
import { useRouter } from "next/navigation";

import { useRef, useEffect } from "react";

import "../custom-geocoder.css";

import getGeocoder from "@/utils/getGeocoder";

import geojson from "../../data/places.json";
import { useSearchResultCtx } from "../context/SearchResultCtx";

export default function LandingSearch() {
  const geocoderContainer = useRef<HTMLDivElement>(null);
  const geocoder = useRef<any>(null);
  const { setSearchResult, setInitialLat, setInitialLng } = useSearchResultCtx();

  const router = useRouter();

  const customData = geojson;

  useEffect(() => {
    geocoder.current = getGeocoder();

    const redirectToMap = () => {
      router.push("/map");
    };

    geocoder.current.on("result", function (result: any) {
      const selectedPlaceId = result.result.properties.identifier;

      for (const place of customData.features) {
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
  }, [customData, router, setInitialLat, setInitialLng, setSearchResult]);

  return <section ref={geocoderContainer} style={{ position: "relative" }} />;
}

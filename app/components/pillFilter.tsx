import React, { useCallback, useEffect, useState } from "react";

import { attachGeocoderListener } from "@/utils/geocoderEvents";
import { categoryFilter, nameFilter, PlaceFilter } from "@/utils/placeFilters";

import Pill from "./pill";

interface PillFilterProps {
  setFilteredPlaces: ([]) => void;
  geocoder: MapboxGeocoder;
}

function PillFilter({ setFilteredPlaces, geocoder }: PillFilterProps) {
  const [geoJsonData, setGeoJsonData] = useState<{ type: string; features: any[] }>({ type: "", features: [] });
  const [filteredResults, setFilteredResults] = useState<{ [key: string]: any[] }>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadGeoJson = async () => {
      setIsLoading(true);
      try {
        const { default: data } = await import("../../data/places.json");
        setGeoJsonData(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGeoJson();
  }, []);

  const clearGeocoder = useCallback(() => {
    if (geocoder) {
      geocoder.clear();
      const input = document.querySelector(".mapboxgl-ctrl-geocoder input") as HTMLInputElement;
      if (input) input.blur();
    }
  }, [geocoder]);

  const resetFilters = useCallback(() => {
    setFilteredPlaces([]);
    setActiveFilter(null);
  }, [setFilteredPlaces]);

  const applyFilter = useCallback(
    (filter: PlaceFilter, category: string) => {
      clearGeocoder();
      if (!geoJsonData) return;

      if (filteredResults[category]) {
        setFilteredPlaces(filteredResults[category]);
      } else {
        const filtered = filter(geoJsonData, category);
        setFilteredResults((prev) => ({ ...prev, [category]: filtered }));
        setFilteredPlaces(filtered);
      }
      setActiveFilter((prevCategory) => (prevCategory === category ? null : category));
      if (activeFilter !== null && filteredResults[category] === filteredResults[activeFilter]) {
        setFilteredPlaces([]);
      }
    },
    [clearGeocoder, geoJsonData, filteredResults, activeFilter, setFilteredPlaces],
  );

  useEffect(() => {
    if (geocoder) {
      const cleanup = attachGeocoderListener(geocoder, "results", resetFilters);
      return cleanup;
    }
  }, [geocoder, resetFilters]);

  return (
    <section className="pointer-events-none relative pe-64 max-map-sm:pe-2 max-map-sm:top-36 h-6 z-50 top-4 flex justify-items-center align-middle justify-center max-map-sm:flex-col">
      <Pill
        title="Comida"
        iconPath="/food.svg"
        onClick={() => applyFilter(categoryFilter, "food_lunch")}
        active={activeFilter === "food_lunch"}
      />
      <Pill
        title="Bibliotecas"
        iconPath="/library.svg"
        onClick={() => applyFilter(nameFilter, "biblioteca")}
        active={activeFilter === "biblioteca"}
      />
      <Pill
        title="Baños"
        iconPath="/toilet.svg"
        onClick={() => applyFilter(categoryFilter, "bath")}
        active={activeFilter === "bath"}
      />
    </section>
  );
}

export default React.memo(PillFilter);

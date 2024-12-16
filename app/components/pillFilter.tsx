import React, { useCallback, useEffect, useState } from "react";

import { categoryFilter, nameFilter, PlaceFilter } from "@/utils/placeFilters";

import Pill from "./pill";

interface PillFilterProps {
  setFilteredPlaces: ([]) => void;
  geocoder: MapboxGeocoder;
}

function PillFilter({ setFilteredPlaces: setGeocoderPlaces, geocoder }: PillFilterProps) {
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
      console.log("geocoder: ", geocoder);
      geocoder.clear();
      const input = document.querySelector(".mapboxgl-ctrl-geocoder input") as HTMLInputElement;
      if (input) {
        input.blur();
      }
    }
  }, [geocoder]);

  const resetFilters = useCallback(() => {
    if (activeFilter) {
      setActiveFilter(null);
    }
  }, [activeFilter]);

  const applyFilter = useCallback(
    (filter: PlaceFilter, category: string) => {
      clearGeocoder();
      if (!geoJsonData) return;

      if (filteredResults[category]) {
        setGeocoderPlaces(filteredResults[category]);
      } else {
        const filtered = filter(geoJsonData, category);
        setFilteredResults((prev) => ({ ...prev, [category]: filtered }));
        setGeocoderPlaces(filtered);
      }
      setActiveFilter((prevCategory) => (prevCategory === category ? null : category));
      if (activeFilter !== null && filteredResults[category] === filteredResults[activeFilter]) {
        setGeocoderPlaces([]);
      }
    },
    [clearGeocoder, geoJsonData, filteredResults, activeFilter, setGeocoderPlaces],
  );

  return (
    <section className="pointer-events-none fixed flex mt-16 overflow-y-auto w-full">
      <Pill
        title="Salas"
        iconPath="/classroom.svg"
        onClick={() => applyFilter(categoryFilter, "classroom")}
        active={activeFilter === "classroom"}
      />
      <Pill
        title="Bibliotecas"
        iconPath="/library.svg"
        onClick={() => applyFilter(nameFilter, "biblioteca")}
        active={activeFilter === "biblioteca"}
      />
      <Pill
        title="Auditorio"
        iconPath="/auditorium.svg"
        onClick={() => applyFilter(categoryFilter, "auditorium")}
        active={activeFilter === "auditorium"}
      />
      <Pill
        title="Comida"
        iconPath="/food.svg"
        onClick={() => applyFilter(categoryFilter, "food_lunch")}
        active={activeFilter === "food_lunch"}
      />
      <Pill
        title="Agua"
        iconPath="/water.svg"
        onClick={() => applyFilter(categoryFilter, "water")}
        active={activeFilter === "water"}
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

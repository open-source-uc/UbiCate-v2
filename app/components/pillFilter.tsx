import React, { useCallback, useEffect, useState } from "react";

import ReactDOM from "react-dom";

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

  useEffect(() => {
    // Cargar datos GeoJSON
    const loadGeoJson = async () => {
      const { default: data } = await import("../../data/places.json");
      setGeoJsonData(data);
    };

    loadGeoJson();
  }, []);

  const clearGeocoder = useCallback(() => {
    if (geocoder) {
      geocoder.clear();
      const input = document.querySelector(".mapboxgl-ctrl-geocoder input") as HTMLInputElement;
      if (input) {
        input.blur();
      }
    }
  }, [geocoder]);

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

  useEffect(() => {
    // Insertar el componente en el contenedor de Mapbox
    const mapboxContainer = document.querySelector(".mapboxgl-ctrl-top-left");

    if (mapboxContainer) {
      const pillsContainer = document.createElement("div");
      pillsContainer.className =
        "mt-auto pointer-events-none overflow-y-auto overflow-hidden min-h-10 | flex justify-center sm:justify-start items-center order-2 pt-3 sm:pt-0 | gap-3 px-5";
      mapboxContainer.appendChild(pillsContainer);

      ReactDOM.render(
        <>
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
        </>,
        pillsContainer,
      );

      return () => {
        ReactDOM.unmountComponentAtNode(pillsContainer);
        mapboxContainer.removeChild(pillsContainer);
      };
    }
  }, [applyFilter, activeFilter]);

  return null;
}

export default React.memo(PillFilter);

import React, { useCallback, useEffect, useRef, useState } from "react";

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
  const pillsContainerRef = useRef<HTMLDivElement | null>(null);

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

  const moveLeft = () => {
    if (pillsContainerRef.current) {
      pillsContainerRef.current.scrollTo({
        left: pillsContainerRef.current.scrollLeft - 150,
        behavior: "smooth", // Desplazamiento suave
      });
    }
  };

  const moveRight = () => {
    if (pillsContainerRef.current) {
      pillsContainerRef.current.scrollTo({
        left: pillsContainerRef.current.scrollLeft + 150,
        behavior: "smooth", // Desplazamiento suave
      });
    }
  };

  useEffect(() => {
    const mapboxContainer = document.querySelector(".mapboxgl-ctrl-top-left");

    if (mapboxContainer) {
      const pillsContainer = document.createElement("div");
      pillsContainer.className =
        "overflow-y-auto overflow-hidden h-10 | flex justify-center sm:justify-start items-center order-2 sm:pt-0 | gap-3 px-5";
      mapboxContainer.appendChild(pillsContainer);

      ReactDOM.render(
        <>
          <button
            className="pointer-events-auto cursor-pointer | flex items-center justify-center bg-white text-gray-800 border-2 border-gray-300 rounded-full p-2 shadow-md transition-all hover:bg-gray-100 hover:border-gray-400 active:scale-95 focus:outline-none w-10 h-10"
            onClick={moveLeft}
          >
            <svg
              className="w-5 h-5 text-gray-800"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div ref={pillsContainerRef} className="flex space-x-3 overflow-hidden">
            <div className="flex-shrink-0">
              <Pill
                title="Salas"
                iconPath="/classroom.svg"
                onClick={() => applyFilter(categoryFilter, "classroom")}
                active={activeFilter === "classroom"}
              />
            </div>
            <div className="flex-shrink-0">
              <Pill
                title="Bibliotecas"
                iconPath="/library.svg"
                onClick={() => applyFilter(nameFilter, "biblioteca")}
                active={activeFilter === "biblioteca"}
              />
            </div>
            <div className="flex-shrink-0">
              <Pill
                title="Auditorio"
                iconPath="/auditorium.svg"
                onClick={() => applyFilter(categoryFilter, "auditorium")}
                active={activeFilter === "auditorium"}
              />
            </div>
            <div className="flex-shrink-0">
              <Pill
                title="Comida"
                iconPath="/food.svg"
                onClick={() => applyFilter(categoryFilter, "food_lunch")}
                active={activeFilter === "food_lunch"}
              />
            </div>
            <div className="flex-shrink-0">
              <Pill
                title="Agua"
                iconPath="/water.svg"
                onClick={() => applyFilter(categoryFilter, "water")}
                active={activeFilter === "water"}
              />
            </div>
            <div className="flex-shrink-0">
              <Pill
                title="Baños"
                iconPath="/toilet.svg"
                onClick={() => applyFilter(categoryFilter, "bath")}
                active={activeFilter === "bath"}
              />
            </div>
          </div>

          <button
            className="pointer-events-auto cursor-pointer | flex items-center justify-center bg-white text-gray-800 border-2 border-gray-300 rounded-full p-2 shadow-md transition-all hover:bg-gray-100 hover:border-gray-400 active:scale-95 focus:outline-none w-10 h-10"
            onClick={moveRight}
          >
            <svg
              className="w-5 h-5 text-gray-800"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
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

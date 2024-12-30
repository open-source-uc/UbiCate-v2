import React, { useCallback, useEffect, useRef, useState } from "react";

import ReactDOM from "react-dom/client";

import { categoryFilter, nameFilter, PlaceFilter } from "@/utils/placeFilters";

import Pill from "./pill";

interface PillFilterProps {
  setFilteredPlaces: ([]) => void;
  geocoder: MapboxGeocoder;
}

function PillFilter({ setFilteredPlaces, geocoder }: PillFilterProps) {
  const [placesGeoJson, setPlacesGeoJson] = useState<{ type: string; features: any[] }>({ type: "", features: [] });
  const [placesFilteredByCategory, setPlacesFilteredByCategory] = useState<{ [key: string]: any[] }>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const pillsRootRef = useRef<ReactDOM.Root | null>(null);
  const buttonAndPillContainerRef = useRef<HTMLDivElement | null>(null);
  const pillsContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadGeoJson = async () => {
      const { default: data } = await import("../../data/places.json");
      setPlacesGeoJson(data);
    };

    loadGeoJson();

    const mapboxContainer = document.querySelector(".mapboxgl-ctrl-top-left");

    if (mapboxContainer && !buttonAndPillContainerRef.current) {
      const pillsContainerAndButton = document.createElement("div");
      pillsContainerAndButton.className =
        "overflow-hidden h-10 | flex justify-start items-center order-2 sm:pt-0 | gap-1";
      mapboxContainer.appendChild(pillsContainerAndButton);

      const root = ReactDOM.createRoot(pillsContainerAndButton);
      pillsRootRef.current = root;
      buttonAndPillContainerRef.current = pillsContainerAndButton;
    }

    return () => {
      // Solución para evitar el error en el desmontaje
      setTimeout(() => {
        if (pillsRootRef.current) {
          pillsRootRef.current.unmount();
          pillsRootRef.current = null;
        }
        if (buttonAndPillContainerRef.current?.parentElement) {
          buttonAndPillContainerRef.current.parentElement.removeChild(buttonAndPillContainerRef.current);
          buttonAndPillContainerRef.current = null;
        }
      }, 0);
    };
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
      if (!placesGeoJson) return;
  
      if (activeFilter === category) {
        setActiveFilter(null); 
        setFilteredPlaces([]); 
        return;
      }
  
      const results = placesFilteredByCategory[category] || filter(placesGeoJson, category);
      setPlacesFilteredByCategory((prev) => ({ ...prev, [category]: results }));
      setFilteredPlaces(results);
      setActiveFilter(category);
    },
    [clearGeocoder, placesGeoJson, placesFilteredByCategory, setFilteredPlaces, activeFilter]
  );
  

  const toggleActiveFilter = (category: string) => {
    setActiveFilter((prev) => (prev === category ? null : category));
  };

  useEffect(() => {
    const moveLeft = () => {
      if (pillsContainer.current) {
        pillsContainer.current.scrollTo({
          left: pillsContainer.current.scrollLeft - 150,
          behavior: "smooth",
        });
      }
    };

    const moveRight = () => {
      if (pillsContainer.current) {
        pillsContainer.current.scrollTo({
          left: pillsContainer.current.scrollLeft + 150,
          behavior: "smooth",
        });
      }
    };

    if (pillsRootRef.current) {
      pillsRootRef.current.render(
        <>
          <button
            type="button"
            className="pointer-events-auto cursor-pointer | flex items-center justify-center bg-white text-gray-800 border-2 border-gray-300 rounded-full p-2 shadow-md transition-all hover:bg-gray-100 hover:border-gray-400 active:scale-95 focus:outline-none w-[36px] h-[36px]"
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
          <div
            className="overflow-x-auto overscroll-none | overflow-auto-chrome overflow-firebox | flex justify-start items-center sm:pt-0 | gap-3"
            ref={pillsContainer}
          >
            <style jsx>{`
              .overflow-auto-chrome::-webkit-scrollbar {
                display: none; /* Oculta la barra de desplazamiento en Chrome y Safari */
              }
              .overflow-firebox {
                scrollbar-width: none; /* Oculta la barra de desplazamiento en Firefox */
              }
            `}</style>
            <Pill
              title="Baños"
              iconPath="/toilet.svg"
              onClick={() => applyFilter(categoryFilter, "bath")}
              active={activeFilter === "bath"}
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
              title="Auditorios"
              iconPath="/auditorium.svg"
              onClick={() => applyFilter(categoryFilter, "auditorium")}
              active={activeFilter === "auditorium"}
            />
            <Pill
              title="Salas de Estudio"
              iconPath="/studyroom.svg"
              onClick={() => applyFilter(categoryFilter, "studyroom")}
              active={activeFilter === "studyroom"}
            />
            <Pill
              title="Bibliotecas"
              iconPath="/library.svg"
              onClick={() => applyFilter(nameFilter, "biblioteca")}
              active={activeFilter === "biblioteca"}
            />
          </div>
          <button
            className="pointer-events-auto cursor-pointer | flex items-center justify-center bg-white text-gray-800 border-2 border-gray-300 rounded-full p-2 shadow-md transition-all hover:bg-gray-100 hover:border-gray-400 active:scale-95 focus:outline-none w-10 h-10"
            onClick={moveRight}
            type="button"
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
      );
    }
  }, [applyFilter, activeFilter]);

  return null;
}

export default React.memo(PillFilter);

import React, { useCallback, useEffect, useRef, useState } from "react";

import { categoryFilter, nameFilter, PlaceFilter } from "@/utils/placeFilters";

import Pill from "./pill";

interface PillFilterProps {
  setFilteredPlaces: ([]) => void;
}

function PillFilter({ setFilteredPlaces }: PillFilterProps) {
  const [placesGeoJson, setPlacesGeoJson] = useState<{ type: string; features: any[] }>({ type: "", features: [] });
  const [placesFilteredByCategory, setPlacesFilteredByCategory] = useState<{ [key: string]: any[] }>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const pillsContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadGeoJson = async () => {
      const { default: data } = await import("@/utils/places");
      setPlacesGeoJson(data);
    };

    loadGeoJson();
  }, []);

  const applyFilter = useCallback(
    (filter: PlaceFilter, category: string) => {
      setFilteredPlaces([]);
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
    [placesGeoJson, placesFilteredByCategory, setFilteredPlaces, activeFilter],
  );

  const moveLeft = () => {
    if (pillsContainer.current) {
      const newScrollLeft = pillsContainer.current.scrollLeft - 150;
      pillsContainer.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const moveRight = () => {
    if (pillsContainer.current) {
      const newScrollLeft = pillsContainer.current.scrollLeft + 150;
      pillsContainer.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const checkScrollPosition = () => {
    if (pillsContainer.current) {
      const container = pillsContainer.current;
      const isAtStart = container.scrollLeft === 0;
      setIsAtStart(isAtStart);

      if (container.scrollLeft + 3 > container.scrollWidth - container.clientWidth) setIsAtEnd(true);
      else setIsAtEnd(false);
    }
  };

  useEffect(() => {
    const container = pillsContainer.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/*
      {isAtStart || (
        <button
          type="button"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 pointer-events-auto cursor-pointer flex items-center justify-center bg-white text-gray-800 border-2 border-gray-300 rounded-full p-2 shadow-md transition-all hover:bg-gray-100 hover:border-gray-400 active:scale-95 focus:outline-hidden w-[36px] h-[36px]"
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
      )}
      */}

      <div className="overflow-x-auto overflow-auto-chrome overflow-firebox space-y-2 p-1" ref={pillsContainer}>
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
          iconGoogle="wc"
          bg_color="bg-deep-cyan-option"
          onClick={() => applyFilter(categoryFilter, "bath")}
          active={activeFilter === "bath"}
        />
        <Pill
          title="Comida"
          iconGoogle="restaurant"
          bg_color="bg-orange-option"
          onClick={() => applyFilter(categoryFilter, "food_lunch")}
          active={activeFilter === "food_lunch"}
        />
        <Pill
          title="Agua"
          iconGoogle="local_drink"
          bg_color="bg-cyan-option"
          onClick={() => applyFilter(categoryFilter, "water")}
          active={activeFilter === "water"}
        />
        <Pill
          title="Crisol"
          iconGoogle="print"
          bg_color="bg-purple-option"
          onClick={() => applyFilter(nameFilter, "crisol")}
          active={activeFilter === "crisol"}
        />
        <Pill
          title="Facultades"
          iconGoogle="school"
          bg_color="bg-deep-red-option"
          onClick={() => applyFilter(categoryFilter, "faculty")}
          active={activeFilter === "faculty"}
        />
        <Pill
          title="Bibliotecas"
          iconGoogle="local_library"
          bg_color="bg-pink-option"
          onClick={() => applyFilter(nameFilter, "biblioteca")}
          active={activeFilter === "biblioteca"}
        />
        <Pill
          title="Salas de Estudio"
          iconGoogle="group"
          bg_color="bg-red-option"
          onClick={() => applyFilter(categoryFilter, "studyroom")}
          active={activeFilter === "studyroom"}
        />
        <Pill
          title="Auditorios"
          iconGoogle="book_2"
          bg_color="bg-green-option"
          onClick={() => applyFilter(categoryFilter, "auditorium")}
          active={activeFilter === "auditorium"}
        />
        <Pill
          title="Deportes"
          iconGoogle="sports_soccer"
          bg_color="bg-deep-green-option"
          onClick={() => applyFilter(categoryFilter, "sports_place")}
          active={activeFilter === "sports_place"}
        />
        <Pill
          title="Estacionamientos"
          iconGoogle="local_parking"
          bg_color="bg-gray-option"
          onClick={() => applyFilter(categoryFilter, "parking")}
          active={activeFilter === "parking"}
        />
      </div>

      {/*
      {isAtEnd || (
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-auto cursor-pointer flex items-center justify-center bg-white text-gray-800 border-2 border-gray-300 rounded-full p-2 shadow-md transition-all hover:bg-gray-100 hover:border-gray-400 active:scale-95 focus:outline-hidden w-[36px] h-[36px]"
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
      )}
      */}
    </div>
  );
}

export default React.memo(PillFilter);

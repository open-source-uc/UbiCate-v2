import React, { useCallback, useEffect, useRef, useState } from "react";

import { categoryFilter, nameFilter, PlaceFilter } from "@/utils/placeFilters";
import { Feature } from "@/utils/types";

import Pill from "./pill";

interface PillFilterProps {
  setFilteredPlaces: ([]) => void;
  setMenu: (place: Feature | null) => void;
}

function PillFilter({ setFilteredPlaces, setMenu }: PillFilterProps) {
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
        setMenu(null);
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
      {isAtStart || (
        <button
          type="button"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 pointer-events-auto cursor-pointer flex items-center justify-center bg-white text-gray-800 border-2 border-gray-300 rounded-full p-2 shadow-md transition-all hover:bg-gray-100 hover:border-gray-400 active:scale-95 focus:outline-none w-[36px] h-[36px]"
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

      <div
        className="overflow-x-auto overflow-auto-chrome overflow-firebox flex justify-start items-center sm:pt-0 gap-3"
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
          title="Bienvenida Novata 2025"
          iconPath="/categoryIcons/party_horn.svg"
          className="bg-pink-300 text-gray-900"
          activateClassName="bg-pink-400"
          onClick={() => {
            setMenu({
              type: "Feature",
              properties: {
                identifier: "bienvenida_2025-01",
                name: "¡Bienvenidos a la Búsqueda del Tesoro de OpenSource UC!",
                information:
                  " ¡Prepárate para una aventura en el campus San Joaquín de la Universidad Católica!\n En esta actividad, explorarás el mapa interactivo de nuestra universidad y te retamos a encontrar tres lugares clave.\n\n## ¿Cómo jugar?\n\n1. **Encuentra y fotografía tres lugares**: Descubre lugares secretos en el mapa y captura una foto de cada uno.\n2. **Vuelve al stand**: Trae tus fotos y ven a nuestro stand en OpenSource UC para confirmar tu participación.\n3. **Deja tus sugerencias**: ¿Tienes ideas? ¡Queremos escucharlas! Deja tus sugerencias en nuestro buzón y ayúdanos a mejorar.\n\nDiviértete, explora y ¡no olvides que hay premios esperándote!",
                categories: ["bienvenida_novata"],
                campus: "SJ",
                faculties: "",
                floors: [1],
                needApproval: false,
              },
              geometry: {
                type: "Point",
                coordinates: [-70.58571815619236, -33.587804325654494],
              },
            });
            applyFilter(categoryFilter, "bienvenida_novata");
          }}
          active={activeFilter === "bienvenida_novata"}
        />
        <Pill
          title="Baños"
          iconPath="/categoryIcons/toilet.svg"
          onClick={() => applyFilter(categoryFilter, "bath")}
          active={activeFilter === "bath"}
        />
        <Pill
          title="Comida"
          iconPath="/categoryIcons/food.svg"
          onClick={() => applyFilter(categoryFilter, "food_lunch")}
          active={activeFilter === "food_lunch"}
        />
        <Pill
          title="Agua"
          iconPath="/categoryIcons/water.svg"
          onClick={() => applyFilter(categoryFilter, "water")}
          active={activeFilter === "water"}
        />
        <Pill
          title="Crisol"
          iconPath="/categoryIcons/crisol.svg"
          onClick={() => applyFilter(nameFilter, "crisol")}
          active={activeFilter === "crisol"}
        />
        <Pill
          title="Facultades"
          iconPath="/categoryIcons/faculty.svg"
          onClick={() => applyFilter(categoryFilter, "faculty")}
          active={activeFilter === "faculty"}
        />
        <Pill
          title="Bibliotecas"
          iconPath="/categoryIcons/library.svg"
          onClick={() => applyFilter(nameFilter, "biblioteca")}
          active={activeFilter === "biblioteca"}
        />
        <Pill
          title="Salas de Estudio"
          iconPath="/categoryIcons/studyroom.svg"
          onClick={() => applyFilter(categoryFilter, "studyroom")}
          active={activeFilter === "studyroom"}
        />
        <Pill
          title="Auditorios"
          iconPath="/categoryIcons/auditorium.svg"
          onClick={() => applyFilter(categoryFilter, "auditorium")}
          active={activeFilter === "auditorium"}
        />
        <Pill
          title="Deportes"
          iconPath="/categoryIcons/sports_place.svg"
          onClick={() => applyFilter(categoryFilter, "sports_place")}
          active={activeFilter === "sports_place"}
        />
        <Pill
          title="Estacionamientos"
          iconPath="/categoryIcons/parking.svg"
          onClick={() => applyFilter(categoryFilter, "parking")}
          active={activeFilter === "parking"}
        />
      </div>
      {isAtEnd || (
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-auto cursor-pointer flex items-center justify-center bg-white text-gray-800 border-2 border-gray-300 rounded-full p-2 shadow-md transition-all hover:bg-gray-100 hover:border-gray-400 active:scale-95 focus:outline-none w-[36px] h-[36px]"
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
    </div>
  );
}

export default React.memo(PillFilter);

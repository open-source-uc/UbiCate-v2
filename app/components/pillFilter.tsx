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

  return (
    <div className="relative w-full max-w-full overflow-hidden pt-2">
      <div
        className="flex flex-row desktop:flex-col overflow-x-auto scroll-smooth snap-x snap-mandatory overflow-auto-chrome overflow-firebox space-x-2 desktop:space-y-2 desktop:p-1 no-scrollbar"
        ref={pillsContainer}
      >
        <style jsx>{`
          .overflow-auto-chrome::-webkit-scrollbar {
            display: none; /* Hide scrollbar in Chrome and Safari */
          }
          .overflow-firebox {
            scrollbar-width: none; /* Hide scrollbar in Firefox */
          }
          .no-scrollbar {
            -ms-overflow-style: none; /* IE and Edge */
          }
        `}</style>
        <div className="snap-start flex-shrink-0">
          <Pill
            title="Baños"
            iconGoogle="wc"
            bg_color="bg-deep-cyan-option"
            onClick={() => applyFilter(categoryFilter, "bath")}
            active={activeFilter === "bath"}
          />
        </div>
        <div className="snap-start flex-shrink-0">
          <Pill
            title="Comida"
            iconGoogle="restaurant"
            bg_color="bg-orange-option"
            onClick={() => applyFilter(categoryFilter, "food_lunch")}
            active={activeFilter === "food_lunch"}
          />
        </div>
        <div className="snap-start flex-shrink-0">
          <Pill
            title="Agua"
            iconGoogle="local_drink"
            bg_color="bg-cyan-option"
            onClick={() => applyFilter(categoryFilter, "water")}
            active={activeFilter === "water"}
          />
        </div>
        <div className="snap-start flex-shrink-0">
          <Pill
            title="Crisol"
            iconGoogle="print"
            bg_color="bg-purple-option"
            onClick={() => applyFilter(nameFilter, "crisol")}
            active={activeFilter === "crisol"}
          />
        </div>
        <div className="snap-start flex-shrink-0">
          <Pill
            title="Facultades"
            iconGoogle="school"
            bg_color="bg-deep-red-option"
            onClick={() => applyFilter(categoryFilter, "faculty")}
            active={activeFilter === "faculty"}
          />
        </div>
        <div className="snap-start flex-shrink-0">
          <Pill
            title="Bibliotecas"
            iconGoogle="local_library"
            bg_color="bg-pink-option"
            onClick={() => applyFilter(nameFilter, "biblioteca")}
            active={activeFilter === "biblioteca"}
          />
        </div>
        <div className="snap-start flex-shrink-0">
          <Pill
            title="Salas de Estudio"
            iconGoogle="group"
            bg_color="bg-red-option"
            onClick={() => applyFilter(categoryFilter, "studyroom")}
            active={activeFilter === "studyroom"}
          />
        </div>
        <div className="snap-start flex-shrink-0">
          <Pill
            title="Auditorios"
            iconGoogle="book_2"
            bg_color="bg-green-option"
            onClick={() => applyFilter(categoryFilter, "auditorium")}
            active={activeFilter === "auditorium"}
          />
        </div>
        <div className="snap-start flex-shrink-0">
          <Pill
            title="Deportes"
            iconGoogle="sports_soccer"
            bg_color="bg-deep-green-option"
            onClick={() => applyFilter(categoryFilter, "sports_place")}
            active={activeFilter === "sports_place"}
          />
        </div>
        <div className="snap-start flex-shrink-0">
          <Pill
            title="Estacionamientos"
            iconGoogle="local_parking"
            bg_color="bg-gray-option"
            onClick={() => applyFilter(categoryFilter, "parking")}
            active={activeFilter === "parking"}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(PillFilter);

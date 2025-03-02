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

  return (
    <div className="relative w-full max-w-full overflow-hidden pt-2">
      <div
        className="grid grid-cols-2 gap-2 scroll-smooth snap-x snap-mandatory overflow-auto-chrome overflow-firefox space-x-2 desktop:flex desktop:flex-col desktop:space-y-2 desktop:p-1 no-scrollbar"
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

        {[
          { title: "Facultades", icon: "school", bg: "bg-deep-red-option", filter: "faculty" },
          { title: "Salas de Estudio", icon: "group", bg: "bg-red-option", filter: "studyroom" },
          { title: "Auditorios", icon: "book_2", bg: "bg-green-option", filter: "auditorium" },
          {
            title: "Bibliotecas",
            icon: "local_library",
            bg: "bg-pink-option",
            filter: "biblioteca",
            isNameFilter: true,
          },
          { title: "Baños", icon: "wc", bg: "bg-deep-cyan-option", filter: "bath" },
          { title: "Comida", icon: "restaurant", bg: "bg-orange-option", filter: "food_lunch" },
          { title: "Agua", icon: "local_drink", bg: "bg-cyan-option", filter: "water" },
          { title: "Deportes", icon: "sports_soccer", bg: "bg-deep-green-option", filter: "sports_place" },
          { title: "Crisol", icon: "print", bg: "bg-purple-option", filter: "crisol", isNameFilter: true },
          { title: "Estacionamientos", icon: "local_parking", bg: "bg-gray-option", filter: "parking" },
        ].map(({ title, icon, bg, filter, isNameFilter }) => (
          <div key={title} className="snap-start flex-shrink-0 w-full min-w-[120px]">
            <Pill
              title={title}
              iconGoogle={icon}
              bg_color={bg}
              onClick={() => applyFilter(isNameFilter ? nameFilter : categoryFilter, filter)}
              active={activeFilter === filter}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(PillFilter);

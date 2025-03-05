import React, { useCallback, useEffect, useRef, useState } from "react";

import { categoryFilter, nameFilter, PlaceFilter } from "@/utils/placeFilters";
import { IconName } from "@/utils/types";

import { useSidebar } from "../context/sidebarCtx";

import Pill from "./pill";

const pills: Array<{
  title: string;
  icon: IconName;
  bg: string;
  filter: string;
  isNameFilter?: boolean;
}> = [
  { title: "Facultades", icon: "school", bg: "bg-deep-red-option", filter: "faculty" },
  { title: "Salas de Estudio", icon: "studyroom", bg: "bg-red-option", filter: "studyroom" },
  { title: "Auditorios", icon: "auditorium", bg: "bg-green-option", filter: "auditorium" },
  {
    title: "Bibliotecas",
    icon: "library",
    bg: "bg-pink-option",
    filter: "biblioteca",
    isNameFilter: true,
  },
  { title: "Baños", icon: "wc", bg: "bg-deep-cyan-option", filter: "bath" },
  { title: "Comida", icon: "restaurant", bg: "bg-orange-option", filter: "food_lunch" },
  { title: "Agua", icon: "localDrink", bg: "bg-cyan-option", filter: "water" },
  { title: "Deportes", icon: "sport", bg: "bg-deep-green-option", filter: "sports_place" },
  { title: "Crisol", icon: "print", bg: "bg-purple-option", filter: "crisol", isNameFilter: true },
  { title: "Estacionamientos", icon: "parking", bg: "bg-gray-option", filter: "parking" },
];

function PillFilter() {
  const [placesGeoJson, setPlacesGeoJson] = useState<{ type: string; features: any[] }>({ type: "", features: [] });
  const [placesFilteredByCategory, setPlacesFilteredByCategory] = useState<{ [key: string]: any[] }>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const pillsContainer = useRef<HTMLDivElement | null>(null);

  const { setPlaces } = useSidebar();

  useEffect(() => {
    const loadGeoJson = async () => {
      const { default: data } = await import("@/utils/places");
      setPlacesGeoJson(data);
    };

    loadGeoJson();
  }, []);

  const applyFilter = useCallback(
    (filter: PlaceFilter, category: string) => {
      setPlaces([]);
      if (!placesGeoJson) return;

      if (activeFilter === category) {
        setActiveFilter(null);
        setPlaces([]);
        return;
      }

      const results = placesFilteredByCategory[category] || filter(placesGeoJson, category);
      setPlacesFilteredByCategory((prev) => ({ ...prev, [category]: results }));
      setPlaces(results);
      setActiveFilter(category);
    },
    [placesGeoJson, placesFilteredByCategory, setPlaces, activeFilter],
  );

  return (
    <div className="relative w-full max-w-full overflow-hidden pt-2">
      <div
        className="grid grid-cols-2 gap-2 scroll-smooth snap-x snap-mandatory overflow-auto-chrome overflow-firefox space-x-2 desktop:flex desktop:flex-col desktop:p-1 no-scrollbar"
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

        {pills.map(({ title, icon, bg, filter, isNameFilter }) => (
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

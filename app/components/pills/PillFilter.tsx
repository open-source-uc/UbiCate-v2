import React, { useCallback, useEffect, useRef, useState } from "react";

import { categoryFilter, nameFilter, PlaceFilter } from "@/app/components/pills/placeFilters";
import { getCategoryColor } from "@/utils/categoryToColors";

import { useSidebar } from "../../context/sidebarCtx";
import * as Icons from "../icons/icons";

import Pill from "./pill";
import { CATEGORIES } from "@/utils/types";

const pills: Array<{
  title: string;
  icon: React.ReactNode;
  filter: string;
  isNameFilter?: boolean;
}> = [
  { title: "Facultades", icon: <Icons.School />, filter: "faculty" },
  { title: "Salas de Estudio", icon: <Icons.Studyroom />, filter: "studyroom" },
  { title: "Auditorios", icon: <Icons.Auditorium />, filter: "auditorium" },
  { title: "Bibliotecas", icon: <Icons.Library />, filter: "biblioteca", isNameFilter: true },
  { title: "Baños", icon: <Icons.Wc />, filter: "bath" },
  { title: "Comida", icon: <Icons.Restaurant />, filter: "food_lunch" },
  { title: "Agua", icon: <Icons.Water />, filter: "water" },
  { title: "Deportes", icon: <Icons.Sport />, filter: "sports_place" },
  { title: "Crisol", icon: <Icons.Print />, filter: "crisol", isNameFilter: true },
  { title: "Estacionamientos", icon: <Icons.Parking />, filter: "parking" },
  { title: "Impresoras", icon: <Icons.Print />, filter: "photocopy" },
  { title: "Bancos / Cajeros", icon: <Icons.Money />, filter: CATEGORIES.FINANCIAL },
  { title: "Tiendas", icon: <Icons.Shop />, filter: CATEGORIES.SHOP },
  { title: "Bicicletas", icon: <Icons.Bike />, filter: CATEGORIES.PARK_BICYCLE },
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
    <div className="relative w-full max-w-full overflow-hidden">
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

        {pills.map(({ title, icon, filter, isNameFilter }) => (
          <div key={title} className="snap-start flex-shrink-0 w-full min-w-[120px]">
            <Pill
              title={title}
              icon={icon}
              bg_color={getCategoryColor(filter.toLowerCase())}
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

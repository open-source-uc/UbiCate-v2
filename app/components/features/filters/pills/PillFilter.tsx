import React, { useCallback, useEffect, useRef, useState } from "react";

import { categoryFilter, PlaceFilter } from "@/app/components/features/filters/pills/placeFilters";
import { useSidebar } from "@/app/context/sidebarCtx";
import { getCategoryColor } from "@/lib/map/categoryToColors";
import { CATEGORIES } from "@/lib/types";

import * as Icons from "../../../ui/icons/icons";

import Pill from "./pill";

type CategoryFilter = {
  title: string;
  icon: React.ReactNode;
  filter: CATEGORIES;
};

const pills: Array<CategoryFilter> = [
  { title: "Facultades, Escuelas, Institutos y otros edificios", icon: <Icons.School />, filter: CATEGORIES.FACULTY },
  { title: "Salas de clases", icon: <Icons.School />, filter: CATEGORIES.CLASSROOM },
  { title: "Salas de estudio", icon: <Icons.Studyroom />, filter: CATEGORIES.STUDYROOM },
  { title: "Auditorios", icon: <Icons.Auditorium />, filter: CATEGORIES.AUDITORIUM },
  { title: "Crisol", icon: <Icons.PersonalComputer />, filter: CATEGORIES.CRISOL },
  { title: "Bibliotecas", icon: <Icons.Library />, filter: CATEGORIES.LIBRARY },
  { title: "Impresoras", icon: <Icons.Print />, filter: CATEGORIES.PHOTOCOPY },
  { title: "Deportes", icon: <Icons.Sport />, filter: CATEGORIES.SPORTS_PLACE },
  { title: "Baños", icon: <Icons.Wc />, filter: CATEGORIES.BATH },
  { title: "Comida", icon: <Icons.Restaurant />, filter: CATEGORIES.FOOD_LUNCH },
  { title: "Agua", icon: <Icons.Water />, filter: CATEGORIES.WATER },
  { title: "Estacionamientos", icon: <Icons.Parking />, filter: CATEGORIES.PARKING },
  { title: "Bancos / Cajeros", icon: <Icons.Money />, filter: CATEGORIES.FINANCIAL },
  { title: "Bicicletas", icon: <Icons.Bike />, filter: CATEGORIES.PARK_BICYCLE },
  { title: "Tiendas", icon: <Icons.Shop />, filter: CATEGORIES.SHOP },
];

function PillFilter() {
  const [placesGeoJson, setPlacesGeoJson] = useState<{ type: string; features: any[] }>({ type: "", features: [] });
  const [placesFilteredByCategory, setPlacesFilteredByCategory] = useState<{ [key: string]: any[] }>({});
  const pillsContainer = useRef<HTMLDivElement | null>(null);

  const { setPlaces, activeFilters, setActiveFilters } = useSidebar();

  useEffect(() => {
    const loadGeoJson = async () => {
      const { default: data } = await import("@/lib/places/data");
      setPlacesGeoJson(data);
    };

    loadGeoJson();
  }, []);

  useEffect(() => {
    if (!placesGeoJson.features || placesGeoJson.features.length === 0) return;
    if (activeFilters.length === 0) {
      setPlaces([]);
      return;
    }

    const allResults: any[] = [];
    const seenIds = new Set<string>();

    activeFilters.forEach((cat) => {
      const results = placesFilteredByCategory[cat] || categoryFilter(placesGeoJson, cat);

      if (!placesFilteredByCategory[cat]) {
        setPlacesFilteredByCategory((prev) => ({ ...prev, [cat]: results }));
      }

      results.forEach((feature: any) => {
        const featureId = feature.properties?.id || JSON.stringify(feature);
        if (!seenIds.has(featureId)) {
          seenIds.add(featureId);
          allResults.push(feature);
        }
      });
    });

    setPlaces(allResults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesGeoJson, activeFilters]);

  const applyFilter = useCallback(
    (filter: PlaceFilter, category: string) => {
      if (!placesGeoJson) return;

      let newActiveFilters: string[];

      if (activeFilters.includes(category)) {
        newActiveFilters = activeFilters.filter((f) => f !== category);
      } else {
        newActiveFilters = [...activeFilters, category];
      }

      setActiveFilters(newActiveFilters);

      if (newActiveFilters.length === 0) {
        setPlaces([]);
        return;
      }

      const allResults: any[] = [];
      const seenIds = new Set<string>();

      newActiveFilters.forEach((cat) => {
        const results = placesFilteredByCategory[cat] || filter(placesGeoJson, cat);

        if (!placesFilteredByCategory[cat]) {
          setPlacesFilteredByCategory((prev) => ({ ...prev, [cat]: results }));
        }

        results.forEach((feature: any) => {
          const featureId = feature.properties?.id || JSON.stringify(feature);
          if (!seenIds.has(featureId)) {
            seenIds.add(featureId);
            allResults.push(feature);
          }
        });
      });

      setPlaces(allResults);
    },
    [placesGeoJson, placesFilteredByCategory, setPlaces, activeFilters, setActiveFilters],
  );

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      <div
        className="grid grid-cols-2 gap-2 scroll-smooth snap-x snap-mandatory overflow-auto-chrome overflow-firefox space-x-2 desktop:flex desktop:flex-col desktop:p-1 no-scrollbar"
        ref={pillsContainer}
      >
        {pills.map(({ title, icon, filter }) => (
          <div key={title} className="snap-start flex-shrink-0 w-full min-w-[120px]">
            <Pill
              title={title}
              icon={icon}
              bg_color={getCategoryColor(filter)}
              onClick={() => applyFilter(categoryFilter, filter)}
              active={activeFilters.includes(filter)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(PillFilter);

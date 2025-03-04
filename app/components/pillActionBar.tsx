import React, { useCallback, useEffect, useRef, useState } from "react";

import { PlaceFilter } from "@/utils/placeFilters";

import { useSidebar } from "../context/sidebarCtx";

function PillFilter() {
  const [placesGeoJson, setPlacesGeoJson] = useState<{ type: string; features: any[] }>({ type: "", features: [] });
  const [placesFilteredByCategory, setPlacesFilteredByCategory] = useState<{ [key: string]: any[] }>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const pillsContainer = useRef<HTMLDivElement | null>(null);

  const { setPlaces, setSelectedPlace } = useSidebar();

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
        setSelectedPlace(null);
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
    <div className="relative w-full max-w-full overflow-x-auto pt-2 no-scrollbar">
      <div className="flex space-x-2 justify-center w-full" />
    </div>
  );
}

export default React.memo(PillFilter);

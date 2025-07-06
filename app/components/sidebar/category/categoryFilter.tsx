import React, { useCallback, useEffect, useRef, useState } from "react";

import { useSidebar } from "../../../context/sidebarCtx";

import Category from "./category";
import { categoryConfigs } from "./categoryConfig";
import { categoryFilter, nameFilter, PlaceFilter } from "./placeFilters";

function CategoriesFilter() {
  const [placesGeoJson, setPlacesGeoJson] = useState<{ type: string; features: any[] }>({ type: "", features: [] });
  const [placesFilteredByCategory, setPlacesFilteredByCategory] = useState<{ [key: string]: any[] }>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const categoriesContainer = useRef<HTMLDivElement | null>(null);

  const { setPlaces } = useSidebar();

  useEffect(() => {
    const loadGeoJson = async () => {
      const { default: data } = await import("../../../../utils/places");
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
        className="grid grid-cols-2 gap-2 scroll-smooth snap-x snap-mandatory overflow-auto-chrome overflow-firefox space-x-2 desktop:grid desktop:grid-cols-3 desktop:gap-3 desktop:p-1 no-scrollbar"
        ref={categoriesContainer}
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

        {categoryConfigs.map(({ title, icon: IconComponent, bg, filter, isNameFilter }) => (
          <div key={title} className="snap-start flex-shrink-0 w-full min-w-[120px] desktop:min-w-0">
            <Category
              title={title}
              icon={<IconComponent />}
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

export default React.memo(CategoriesFilter);

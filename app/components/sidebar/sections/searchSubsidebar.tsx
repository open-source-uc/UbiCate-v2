import { useEffect, useRef } from "react";

import { SubSidebarType } from "../../../../utils/types";
import CategoriesFilter from "../category/categoryFilter";
import SidebarCloseButton from "../ui/CloseButton";
import SidebarHeader from "../ui/sidebarHeader";

interface SearchSubsidebarProps {
  geocoder: React.RefObject<MapboxGeocoder | null>;
  setActiveSubSidebar: (value: SubSidebarType) => void;
  onSearchSelection: () => void;
}

export default function SearchSubsidebar({ geocoder, setActiveSubSidebar, onSearchSelection }: SearchSubsidebarProps) {
  const refSearchContainer = useRef<HTMLDivElement | null>(null);

  // Add geocoder to container when component mounts
  useEffect(() => {
    const container = refSearchContainer.current;
    if (container && geocoder.current) {
      // Check if geocoder is already attached to avoid duplication
      if (!container.hasChildNodes()) {
        geocoder.current.addTo(container);
      }
    }

    // Cleanup function to clear container when component unmounts
    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [geocoder]);

  // Handle search result selection
  useEffect(() => {
    let current: MapboxGeocoder | null = null;
    if (geocoder.current) {
      geocoder.current.on("result", onSearchSelection);
      current = geocoder.current;
    }
    return () => {
      current?.off("result", onSearchSelection);
    };
  }, [geocoder, onSearchSelection]);

  return (
    <div className="w-full h-full flex flex-col">
      <SidebarHeader
        title="Buscar"
        rightContent={<SidebarCloseButton onClick={() => setActiveSubSidebar(null)} ariaLabel="Cerrar búsqueda" />}
      />

      <div className="flex-1 overflow-auto space-y-4 px-2">
        {/* Search Container */}
        <div className="w-full">
          <section ref={refSearchContainer} />
        </div>

        {/* Place Filters */}
        <div className="w-full">
          <h4 className="font-semibold text-md mb-3">Filtra por lugares</h4>
          <CategoriesFilter />
        </div>
      </div>
    </div>
  );
}

import { useRef } from "react";

import { SubSidebarType } from "../../../../utils/types";
import { useSidebar } from "../../../context/sidebarCtx";
import CustomSearchInput from "../../search/CustomSearchInput";
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
  const { setSelectedPlace, setPlaces } = useSidebar();

  // Handle search result selection
  const handleSearchResult = (result: any) => {
    // Set the selected place and update the places array to display the marker
    setSelectedPlace(result.feature);
    setPlaces(result.feature);
    // Handle the selected search result
    onSearchSelection();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <SidebarHeader
        title="Buscar"
        rightContent={<SidebarCloseButton onClick={() => setActiveSubSidebar(null)} ariaLabel="Cerrar búsqueda" />}
      />

      <div className="flex-1 overflow-auto space-y-4 px-2">
        {/* Search Container */}
        <div className="w-full">
          <CustomSearchInput onResult={handleSearchResult} placeholder="Buscar lugares en UC" autoFocus />
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

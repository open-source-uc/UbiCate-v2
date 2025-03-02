import React, { useCallback, useEffect, useRef, useState } from "react";

import { categoryFilter, nameFilter, PlaceFilter } from "@/utils/placeFilters";

import { useSidebar } from "../context/sidebarCtx";

import Pill from "./pill";

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
      <div className="flex space-x-2">
        {[
          {
            title: "Evento Bienvenida Novata 🎉",
            icon: "school",
            bg: "bg-pink-option",
            filter: "bienvenida_novata",
            isNameFilter: false,
          },
        ].map(({ title, icon, bg, filter, isNameFilter }) => (
          <div key={title} className="flex-shrink-0 min-w-[120px]">
            <Pill
              title={title}
              iconGoogle={icon}
              bg_color={bg}
              onClick={() => {
                setSelectedPlace({
                  type: "Feature",
                  properties: {
                    identifier: "bienvenida_2025-010",
                    name: "¡Bienvenidos a la Búsqueda del Tesoro de OpenSource UC!",
                    information:
                      " ¡Prepárate para una aventura en el campus San Joaquín de la Universidad Católica!\n En esta actividad, explorarás el mapa interactivo de nuestra universidad y te retamos a encontrar tres lugares clave.\n\n## ¿Cómo jugar?\n\n1. **Encuentra y fotografía tres lugares**: Descubre lugares secretos en el mapa y captura una foto de cada uno.\n\n2. **Vuelve al stand**: Trae tus fotos y ven a nuestro stand en OpenSource UC para confirmar tu participación.\n\n3. \n\n**Diviértete, explora y ¡no olvides que hay premios esperándote!**",
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
                applyFilter(isNameFilter ? nameFilter : categoryFilter, filter);
              }}
              active={activeFilter === filter}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(PillFilter);

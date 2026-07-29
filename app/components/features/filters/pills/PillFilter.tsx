import React, { useCallback, useEffect, useMemo, useRef } from "react";

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

const regularPills: Array<CategoryFilter> = [
  { title: "Facultades, Escuelas, Institutos y otros edificios", icon: <Icons.School />, filter: CATEGORIES.FACULTY },
  { title: "Salas de clases", icon: <Icons.School />, filter: CATEGORIES.CLASSROOM },
  { title: "Salas de estudio", icon: <Icons.Studyroom />, filter: CATEGORIES.STUDYROOM },
  { title: "Salas Crisol", icon: <Icons.PersonalComputer />, filter: CATEGORIES.CRISOL },
  { title: "Auditorios", icon: <Icons.Auditorium />, filter: CATEGORIES.AUDITORIUM },
  { title: "Laboratorios", icon: <Icons.Biotech />, filter: CATEGORIES.LABORATORY },
  { title: "Bibliotecas", icon: <Icons.Library />, filter: CATEGORIES.LIBRARY },
  { title: "Impresoras / Fotocopias", icon: <Icons.Print />, filter: CATEGORIES.PHOTOCOPY },
  { title: "Deportes", icon: <Icons.Sport />, filter: CATEGORIES.SPORTS_PLACE },
  { title: "Baños", icon: <Icons.Wc />, filter: CATEGORIES.BATH },
  { title: "Agua", icon: <Icons.Water />, filter: CATEGORIES.WATER },
  { title: "Comida / Mesón UC", icon: <Icons.Restaurant />, filter: CATEGORIES.FOOD_LUNCH },
  { title: "Puntos Limpios", icon: <Icons.Recycling />, filter: CATEGORIES.TRASH },
  { title: "Tiendas", icon: <Icons.Shop />, filter: CATEGORIES.SHOP },
  { title: "Bancos / Cajeros", icon: <Icons.Money />, filter: CATEGORIES.FINANCIAL },
  { title: "Oficinas", icon: <Icons.Domain />, filter: CATEGORIES.OFFICES },
  { title: "Bicicleteros", icon: <Icons.Bike />, filter: CATEGORIES.PARK_BICYCLE },
  { title: "Estacionamientos", icon: <Icons.Parking />, filter: CATEGORIES.PARKING },
  { title: "Cultura", icon: <Icons.Palette />, filter: CATEGORIES.CULTURE },
  { title: "Edificios de clases", icon: <Icons.School />, filter: CATEGORIES.CLASSROOM_BUILDING },
];

const emergencyPills: Array<CategoryFilter> = [
  { title: "Seguridad", icon: <Icons.Emergency />, filter: CATEGORIES.SECURITY },
  { title: "DEA", icon: <Icons.DEA />, filter: CATEGORIES.DEA },
];

function PillFilter() {
  const pillsContainer = useRef<HTMLDivElement | null>(null);

  const { setPlaces, activeFilters, setActiveFilters, allFeatures, isDataLoaded } = useSidebar();

  const placesGeoJson = useMemo(() => ({ type: "FeatureCollection", features: allFeatures }), [allFeatures]);

  // Recalcula SIEMPRE desde placesGeoJson (el allFeatures actual). Antes se cacheaba por categoría en un
  // estado que no se refrescaba al llegar datos nuevos → los pills mostraban lo viejo hasta un F5.
  const buildFilteredPlaces = useCallback(
    (filters: string[], filterFn: PlaceFilter = categoryFilter) => {
      const allResults: any[] = [];
      const seenIds = new Set<string>();

      filters.forEach((cat) => {
        const results = filterFn(placesGeoJson, cat);
        results.forEach((feature: any) => {
          const featureId = feature.properties?.identifier ?? feature.properties?.id ?? JSON.stringify(feature);
          if (!seenIds.has(featureId)) {
            seenIds.add(featureId);
            allResults.push(feature);
          }
        });
      });

      return allResults;
    },
    [placesGeoJson],
  );

  // Al cambiar los datos (allFeatures → placesGeoJson) o los filtros activos, recarga los puntos del mapa.
  useEffect(() => {
    if (!isDataLoaded || allFeatures.length === 0) return;
    if (activeFilters.length === 0) {
      setPlaces([]);
      return;
    }
    setPlaces(buildFilteredPlaces(activeFilters));
  }, [buildFilteredPlaces, activeFilters, isDataLoaded, allFeatures.length, setPlaces]);

  const applyFilter = useCallback(
    (filter: PlaceFilter, category: string) => {
      if (!isDataLoaded) return;

      const newActiveFilters = activeFilters.includes(category)
        ? activeFilters.filter((f) => f !== category)
        : [category];

      setActiveFilters(newActiveFilters);
      setPlaces(newActiveFilters.length === 0 ? [] : buildFilteredPlaces(newActiveFilters, filter));
    },
    [buildFilteredPlaces, setPlaces, activeFilters, setActiveFilters, isDataLoaded],
  );

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      <div
        className="grid grid-cols-2 gap-2 scroll-smooth snap-x snap-mandatory overflow-auto-chrome overflow-firefox space-x-2 desktop:flex desktop:flex-col desktop:p-1 no-scrollbar"
        ref={pillsContainer}
      >
        {regularPills.map(({ title, icon, filter }) => (
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

        <div className="col-span-2 mt-1 mb-0.5 px-1 desktop:mt-3 desktop:mb-1 desktop:px-0">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
            Emergencias y Seguridad
          </p>
          <div className="mt-1 h-px w-full bg-border" />
        </div>

        {emergencyPills.map(({ title, icon, filter }) => (
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

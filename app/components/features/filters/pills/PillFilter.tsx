import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { categoryFilter, PlaceFilter } from "@/app/components/features/filters/pills/placeFilters";
import { useSidebar } from "@/app/context/sidebarCtx";
import { getCategoryColor } from "@/lib/map/categoryToColors";
import { allEvents as staticAllEvents, default as eventsJSON } from "@/lib/places/eventsData";
import { CATEGORIES, EventFeature, Feature, getParentPlaceIds, isEventVisible } from "@/lib/types";

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

function getActiveEvents(events: EventFeature[]): EventFeature[] {
  const now = new Date();
  return events.filter((ev) => isEventVisible(ev.properties, now));
}

function getEventPlaces(
  events: EventFeature[],
  placesGeoJson: { features: any[] },
  eventPlaceFeatures: Feature[],
): { places: Feature[] } {
  const places: Feature[] = [];
  const seenIds = new Set<string>();
  const eventsByPlace = new Map<string, EventFeature[]>();

  events.forEach((event) => {
    const parentIds = getParentPlaceIds(event.properties);
    parentIds.forEach((id) => {
      const list = eventsByPlace.get(id) || [];
      list.push(event);
      eventsByPlace.set(id, list);
    });
  });

  eventPlaceFeatures.forEach((place) => {
    const featureId = place.properties.identifier;
    if (seenIds.has(featureId)) return;

    // Un lugar de evento sin eventos que lo apunten no se muestra
    const eventList = eventsByPlace.get(featureId) || [];
    if (eventList.length === 0) return;

    seenIds.add(featureId);

    const displayName = eventList.length === 1 ? eventList[0].properties.name : `${eventList.length} eventos`;
    places.push({ ...place, properties: { ...place.properties, displayName } });
  });

  events.forEach((event) => {
    const parentIds = getParentPlaceIds(event.properties);
    parentIds.forEach((parentPlaceId) => {
      const parentPlace =
        placesGeoJson.features.find((f: Feature) => f.properties.identifier === parentPlaceId) ||
        eventPlaceFeatures.find((f) => f.properties.identifier === parentPlaceId);

      if (parentPlace) {
        const featureId = parentPlace.properties?.identifier || JSON.stringify(parentPlace);
        if (!seenIds.has(featureId)) {
          seenIds.add(featureId);
          const eventList = eventsByPlace.get(featureId) || [];
          const displayName = eventList.length === 1 ? eventList[0].properties.name : `${eventList.length} eventos`;
          places.push({ ...parentPlace, properties: { ...parentPlace.properties, displayName } });
        }
      }
    });
  });

  return { places };
}

function PillFilter() {
  const [placesGeoJson, setPlacesGeoJson] = useState<{ type: string; features: any[] }>({ type: "", features: [] });
  const [placesFilteredByCategory, setPlacesFilteredByCategory] = useState<{ [key: string]: any[] }>({});
  const pillsContainer = useRef<HTMLDivElement | null>(null);

  const { setPlaces, activeFilters, setActiveFilters, setEventCounts, setEventPlaceIds } = useSidebar();

  const allEvents: EventFeature[] = useMemo(() => staticAllEvents, []);
  const activeEvents = useMemo(() => getActiveEvents(allEvents), [allEvents]);
  const eventPlaceFeatures: Feature[] = useMemo(
    () => eventsJSON.features.filter((f): f is Feature => !("startDate" in f.properties)),
    [],
  );

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
      setEventCounts(new Map());
      setEventPlaceIds(new Set());
      return;
    }

    const allResults: any[] = [];
    const seenIds = new Set<string>();
    const currentEventPlaceIds = new Set<string>();

    activeFilters.forEach((cat) => {
      if (cat === CATEGORIES.EVENTS) {
        const { places } = getEventPlaces(activeEvents, placesGeoJson, eventPlaceFeatures);
        places.forEach((place) => {
          const featureId = place.properties?.identifier || JSON.stringify(place);
          if (!seenIds.has(featureId)) {
            seenIds.add(featureId);
            allResults.push(place);
            currentEventPlaceIds.add(place.properties.identifier);
          }
        });
      } else {
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
      }
    });

    setEventCounts(new Map());
    setEventPlaceIds(currentEventPlaceIds);
    setPlaces(allResults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesGeoJson, activeFilters, activeEvents, eventPlaceFeatures]);

  const applyFilter = useCallback(
    (filter: PlaceFilter | ((geojson: any, cat: string) => any[]), category: string) => {
      if (!placesGeoJson) return;

      let newActiveFilters: string[];

      if (activeFilters.includes(category)) {
        newActiveFilters = activeFilters.filter((f) => f !== category);
      } else {
        newActiveFilters = [category];
      }

      setActiveFilters(newActiveFilters);

      if (newActiveFilters.length === 0) {
        setPlaces([]);
        setEventCounts(new Map());
        setEventPlaceIds(new Set());
        return;
      }

      const allResults: any[] = [];
      const seenIds = new Set<string>();
      const currentEventPlaceIds = new Set<string>();

      newActiveFilters.forEach((cat) => {
        if (cat === CATEGORIES.EVENTS) {
          const { places } = getEventPlaces(activeEvents, placesGeoJson, eventPlaceFeatures);
          places.forEach((place) => {
            const featureId = place.properties?.identifier || JSON.stringify(place);
            if (!seenIds.has(featureId)) {
              seenIds.add(featureId);
              allResults.push(place);
              currentEventPlaceIds.add(place.properties.identifier);
            }
          });
        } else {
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
        }
      });

      setEventCounts(new Map());
      setEventPlaceIds(currentEventPlaceIds);
      setPlaces(allResults);
    },
    [
      placesGeoJson,
      placesFilteredByCategory,
      setPlaces,
      activeFilters,
      setActiveFilters,
      activeEvents,
      setEventCounts,
      setEventPlaceIds,
    ],
  );

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      <div
        className="grid grid-cols-2 gap-2 scroll-smooth snap-x snap-mandatory overflow-auto-chrome overflow-firefox space-x-2 desktop:flex desktop:flex-col desktop:p-1 no-scrollbar"
        ref={pillsContainer}
      >
        <div className="col-span-2 mt-1 mb-0.5 px-1 desktop:mt-1 desktop:mb-1 desktop:px-0">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
            Categorías generales
          </p>
          <div className="mt-1 h-px w-full bg-border" />
        </div>

        {activeEvents.length > 0 && (
          <div className="snap-start flex-shrink-0 w-full min-w-[120px]">
            <Pill
              title="Eventos"
              icon={<Icons.Event />}
              bg_color={getCategoryColor(CATEGORIES.EVENTS)}
              onClick={() => applyFilter(categoryFilter, CATEGORIES.EVENTS)}
              active={activeFilters.includes(CATEGORIES.EVENTS)}
            />
          </div>
        )}

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

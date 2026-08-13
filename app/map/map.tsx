"use client";

import { useSearchParams } from "next/navigation";

import React, { use, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { bbox } from "@turf/bbox";
import type { LngLatBoundsLike, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import type { ViewState, PointLike, PaddingOptions, MarkerDragEvent, MapRef } from "react-map-gl/maplibre";
import { Map, Source, Layer, Marker as MapLibreMarker } from "react-map-gl/maplibre";

import DebugMode from "@/app/debug/debugMode";
import Campus from "@/data/campuses.json";
import { getCampusBoundsFromName, getMaxCampusBoundsFromName } from "@/lib/campus/getCampusBounds";
import { featuresToGeoJSON } from "@/lib/geojson/featuresToGeoJSON";
import { normalizeIdentifier } from "@/lib/places/utils";
import { Feature, PointFeature, CATEGORIES, siglas } from "@/lib/types";

import { SilentErrorBoundary } from "../components/app/appErrors/SilentErrorBoundary";
import Changelog from "../components/features/changelog/Changelog";
import DirectionsComponent from "../components/features/directions/component";
import RouteLayer from "../components/features/directions/routeLayer";
import UserLocation from "../components/features/directions/userLocation";
import RouteMapLayer, {
  ROUTE_BORDER_COLOR,
  ROUTE_COLOR,
  RoutePlacesLayer,
} from "../components/features/routes/routeMapLayer";
import MarkerIcon from "../components/ui/icons/markerIcon";
import MaterialSymbol from "../components/ui/icons/MaterialSymbol";
import { useMapPicking } from "../context/mapPickingCtx";
import { pinsContext } from "../context/pinsCtx";
import { useSidebar } from "../context/sidebarCtx";

import { HandlePlaceSelectionOptions, useMapEvents } from "./hooks/useMapEvents";
import { useMapStyle } from "./hooks/useMapStyle";
import Marker from "./marker";
import PickingOverlay from "./pickingOverlay";

interface InitialViewState extends Partial<ViewState> {
  bounds?: LngLatBoundsLike;
  fitBoundsOptions?: {
    offset?: PointLike;
    padding?: number | PaddingOptions;
  };
}

function createInitialViewState(
  campusName: string | null,
  paramPlace: Feature | null | undefined,
  paramLng: number | null | undefined,
  paramLat: number | null | undefined,
): InitialViewState {
  const initialViewState: InitialViewState = {
    zoom: 17,
  };

  if (paramPlace) {
    if (paramPlace?.geometry.type === "Point") {
      initialViewState.longitude = paramPlace?.geometry.coordinates[0];
      initialViewState.latitude = paramPlace?.geometry.coordinates[1];
    }
    if (paramPlace?.geometry.type === "Polygon") {
      initialViewState.bounds = bbox(paramPlace?.geometry) as LngLatBoundsLike;
    }
  } else if (paramLng && paramLat) {
    initialViewState.longitude = paramLng;
    initialViewState.latitude = paramLat;
    initialViewState.zoom = 17;
  } else {
    initialViewState.bounds = getCampusBoundsFromName(campusName);
  }

  return initialViewState;
}

function rectangleRing(a: { lng: number; lat: number }, b: { lng: number; lat: number }): [number, number][] {
  const minLng = Math.min(a.lng, b.lng);
  const maxLng = Math.max(a.lng, b.lng);
  const minLat = Math.min(a.lat, b.lat);
  const maxLat = Math.max(a.lat, b.lat);
  return [
    [minLng, minLat],
    [maxLng, minLat],
    [maxLng, maxLat],
    [minLng, maxLat],
  ];
}

export default function MapComponent({
  paramPlace,
  paramLng,
  paramLat,
}: {
  paramPlace?: Feature | null;
  paramLng?: number | null;
  paramLat?: number | null;
}) {
  const mapRef = useRef<MapRef>(null);
  const params = useSearchParams();
  const {
    points,
    polygons,
    pointsName,
    setPlaces,
    activeFilters,
    eventPlaceIds,
    allFeatures,
    selectedRoute,
    openRoutesPanel,
  } = useSidebar();
  const isEventsFilter = activeFilters.includes(CATEGORIES.EVENTS);
  const { pins, setPinsFromCoords, handlePinDrag, polygon, line, removePin } = use(pinsContext);
  const {
    isPicking,
    mode,
    isForEvent,
    isForRoute,
    routePlaceIds,
    isDrawingRect,
    setDrawingRect,
    setPicking,
    isViewOnly,
    isCreatingPlace,
  } = useMapPicking();
  const isEventMode = isEventsFilter || isPicking || isForEvent;
  // También con el formulario abierto (picking apagado): los pins siguen en pantalla y deben leerse como
  // una ruta, no como los vértices sueltos de un polígono.
  const isDrawingLine = isForRoute || (isPicking && mode === "line");
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const featuresByIds = useCallback(
    (placeIds: string[]) => {
      if (placeIds.length === 0) return [];
      const ids = new Set(placeIds.map((id) => normalizeIdentifier(id)));
      return allFeatures.filter((f) => ids.has(normalizeIdentifier(f.properties.identifier)));
    },
    [allFeatures],
  );

  const selectedRoutePlaces = useMemo(
    () => (selectedRoute ? featuresByIds(selectedRoute.properties.placeIds) : []),
    [selectedRoute, featuresByIds],
  );

  // Lugares del formulario de ruta abierto: se pintan mientras se editan los datos (no mientras se
  // dibuja la línea, que ahí el lienzo va limpio).
  const routeFormPlaces = useMemo(
    () => (isForRoute && !isPicking ? featuresByIds(routePlaceIds) : []),
    [isForRoute, isPicking, routePlaceIds, featuresByIds],
  );
  const wasDraggingRef = useRef(false);
  const rectJustFinishedRef = useRef(false);
  const [rectPreview, setRectPreview] = useState<[number, number][] | null>(null);

  useEffect(() => {
    if (!isPicking) setSelectedPinId(null);
  }, [isPicking]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !isDrawingRect) return;

    map.dragPan.disable();
    map.getCanvas().style.cursor = "crosshair";
    let start: { lng: number; lat: number } | null = null;
    // En touchend maplibre ya no trae coordenadas (no quedan dedos en pantalla), así que se cierra el
    // rectángulo con la última posición vista en touchmove.
    let lastTouch: { lng: number; lat: number } | null = null;

    const begin = (lngLat: { lng: number; lat: number }) => {
      start = { lng: lngLat.lng, lat: lngLat.lat };
      setRectPreview(null);
    };
    const drag = (lngLat: { lng: number; lat: number }) => {
      if (!start) return;
      setRectPreview(rectangleRing(start, { lng: lngLat.lng, lat: lngLat.lat }));
    };
    const finish = (lngLat: { lng: number; lat: number } | null) => {
      if (!start || !lngLat) return;
      const s = start;
      const end = { lng: lngLat.lng, lat: lngLat.lat };
      start = null;
      setRectPreview(null);
      if (Math.abs(s.lng - end.lng) < 1e-6 || Math.abs(s.lat - end.lat) < 1e-6) return;
      setPinsFromCoords(rectangleRing(s, end));
      // El `click` que maplibre emite después del touchend/mouseup llegaría con el cuadrado ya
      // desarmado y agregaría un vértice suelto.
      rectJustFinishedRef.current = true;
      setTimeout(() => {
        rectJustFinishedRef.current = false;
      }, 400);
      setPicking(true, "polygon");
      setDrawingRect(false);
    };

    const onDown = (e: MapMouseEvent) => begin(e.lngLat);
    const onMove = (e: MapMouseEvent) => drag(e.lngLat);
    const onUp = (e: MapMouseEvent) => finish(e.lngLat);

    // Un solo dedo dibuja; con dos o más se deja pasar el gesto de zoom/rotar.
    const onTouchStart = (e: MapTouchEvent) => {
      if (e.points.length > 1) return;
      lastTouch = { lng: e.lngLat.lng, lat: e.lngLat.lat };
      begin(e.lngLat);
    };
    const onTouchMove = (e: MapTouchEvent) => {
      if (e.points.length > 1) return;
      lastTouch = { lng: e.lngLat.lng, lat: e.lngLat.lat };
      drag(e.lngLat);
    };
    const onTouchEnd = () => {
      finish(lastTouch);
      lastTouch = null;
    };

    map.on("mousedown", onDown);
    map.on("mousemove", onMove);
    map.on("mouseup", onUp);
    map.on("touchstart", onTouchStart);
    map.on("touchmove", onTouchMove);
    map.on("touchend", onTouchEnd);

    return () => {
      map.off("mousedown", onDown);
      map.off("mousemove", onMove);
      map.off("mouseup", onUp);
      map.off("touchstart", onTouchStart);
      map.off("touchmove", onTouchMove);
      map.off("touchend", onTouchEnd);
      map.dragPan.enable();
      map.getCanvas().style.cursor = "";
      setRectPreview(null);
    };
  }, [isDrawingRect, setPinsFromCoords, setPicking, setDrawingRect]);
  const { handleMapLoad, handlePlaceSelection, handleMapClick, selectionLocked } = useMapEvents({
    mapRef,
    paramPlace,
    paramLng,
    paramLat,
  });
  const mapConfig = useMapStyle();

  // La etiqueta se pinta morada con `["in", "events", ["get", "categories"]]` (ver los temas), así que
  // el lugar con evento necesita la categoría aunque no la tenga guardada. Va sobre puntos Y polígonos:
  // dejando los polígonos fuera, sus labels ("N eventos" incluido) quedaban negros.
  const labelFeatures = useMemo(() => {
    if (isCreatingPlace) return [];
    const features = [...pointsName, ...polygons];
    if (!isEventsFilter) return features;
    return features.map((p) =>
      eventPlaceIds.has(p.properties.identifier) && !p.properties.categories.includes(CATEGORIES.EVENTS)
        ? { ...p, properties: { ...p.properties, categories: [CATEGORIES.EVENTS, ...p.properties.categories] } }
        : p,
    );
  }, [pointsName, polygons, isEventsFilter, eventPlaceIds, isCreatingPlace]);

  // Los nombres de campus se muestran mediante el tag; no crear puntos en el mapa.

  // Obtener nombre del campus para el tag
  const [campusDisplayName, setCampusDisplayName] = React.useState<string | null>(null);

  useEffect(() => {
    const campusParam = params.get("campus");
    const campus = campusParam || localStorage.getItem("defaultCampus");

    if (campus) {
      let fullName: string | undefined;

      if (campus.length === 2) {
        fullName = siglas.get(campus);
      } else {
        const sigla = siglas.get(campus);
        fullName = sigla ? siglas.get(sigla) : undefined;
      }

      setCampusDisplayName(fullName || campus);
    } else {
      setCampusDisplayName(null);
    }
  }, [params]);

  useEffect(() => {
    const campusName = params.get("campus");
    if (campusName) {
      mapRef.current?.getMap()?.setMaxBounds(undefined);
      localStorage.setItem("defaultCampus", campusName);
      mapRef.current?.getMap()?.fitBounds(getCampusBoundsFromName(campusName), {
        duration: 0,
        zoom:
          campusName === "SJ" || campusName === "SanJoaquin"
            ? 15.5
            : campusName === "VR" || campusName === "Villarrica"
              ? 14
              : 17,
      });
      mapRef.current?.getMap().setMaxBounds(getMaxCampusBoundsFromName(localStorage.getItem("defaultCampus")));
    }
  }, [params]);

  useEffect(() => {
    const category = params.get("category");
    if (!category || allFeatures.length === 0) return;

    const filteredPlaces = allFeatures.filter((feature) => feature.properties.categories.includes(category));
    setPlaces(filteredPlaces);
  }, [params, setPlaces, allFeatures]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;

    const observer = new ResizeObserver(() => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      }, 175); // 200 para evitar resize excesivos, debido a la animación de la sidebar que dura 150ms
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {/* Desktop: tag "Novedades" a la izquierda del tag de campus. En mobile va en TopMobileSidebar. */}
      {!isPicking ? (
        <div className="hidden lg:flex absolute top-4 right-4 z-10 items-center gap-2 pointer-events-auto">
          <Changelog />
          {campusDisplayName ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary rounded-lg shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
              <span className="text-xs font-medium text-primary-foreground">Campus {campusDisplayName}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <Map
        id="mainMap"
        mapStyle={mapConfig.mapStyle}
        initialViewState={createInitialViewState(params.get("campus"), paramPlace, paramLng, paramLat)}
        interactiveLayerIds={[
          "points-layer-2",
          "points-layer-3",
          "area-polygon",
          "debug-area-polygon",
          "custom-area-polygon",
          "event-points-layer",
          "event-polygon-layer",
          // Ruta elegida: la línea abre el panel de Rutas; sus lugares abren la ficha del lugar.
          // Para la línea se usa el área de contacto ancha, no la línea visible.
          "ubicate-route-hit",
          "ubicate-route-places-point",
          "ubicate-route-places-area",
        ]}
        onClick={(e) => {
          if (isDrawingRect || rectJustFinishedRef.current) return;
          // La línea de la ruta abre su ficha. Se resuelve acá y no en useMapEvents porque acá está el
          // objeto que se dibujó: reconstruirlo desde las properties del feature (que maplibre
          // serializa) daba "esta ruta ya no está disponible".
          if (selectedRoute && e.features?.length) {
            const hitRoute = e.features.some((f) => f.layer?.id === "ubicate-route-hit");
            const hitPlace = e.features.some((f) => f.layer?.id !== "ubicate-route-hit");
            if (hitRoute && !hitPlace) {
              openRoutesPanel(selectedRoute);
              return;
            }
          }
          if (selectedPinId) {
            setSelectedPinId(null);
            return;
          }
          handleMapClick(e);
        }}
        onLoad={(e) => handleMapLoad(e)}
        transformRequest={(url, type) => {
          if (type === "Tile" || type === "Glyphs") {
            if (process.env.NEXT_PUBLIC_IS_SELF_HOST === "TRUE") {
              return { url: window.location.origin + url };
            } else {
              console.log("OSUC SERVER MAP");
              return { url: `https://ubicate.osuc.dev${url}` };
            }
          }
          return { url };
        }}
        ref={mapRef}
      >
        <Source id="campusSmall" type="geojson" data={Campus as GeoJSON.FeatureCollection<GeoJSON.Geometry>}>
          <Layer {...mapConfig.campusBorderLayer} />
        </Source>
        {/* Los lugares del filtro (puntos, polígonos y labels) se esconden mientras se crea un punto:
            el lienzo tiene que quedar limpio para dibujar. */}
        <Source id="areas-uc" type="geojson" data={featuresToGeoJSON(isCreatingPlace ? [] : polygons)}>
          <Layer
            id="area-polygon"
            type="fill"
            paint={{
              "fill-color": isEventMode ? "rgba(147, 51, 234, 0.1)" : "rgba(1, 95, 255, 0.1)",
            }}
          />
          <Layer
            id="area-stroke"
            type="line"
            paint={{
              "line-color": isEventMode ? "#9333EA" : "#015FFF",
              "line-width": 0.7,
              "line-dasharray": [4, 2],
            }}
          />
        </Source>
        {/* En modo línea el memo `polygon` sigue vivo (≥3 pins) y pintaría un área sobre la ruta. */}
        <Source
          id="custom-polygon-area"
          type="geojson"
          data={featuresToGeoJSON(isEventMode || isDrawingLine ? [] : polygon)}
        >
          <Layer {...mapConfig.customPolygonSectionAreaLayer} />
          <Layer {...mapConfig.customPolygonStrokeLayer} />
        </Source>
        <Source
          id="event-polygon-area"
          type="geojson"
          data={featuresToGeoJSON(isEventMode && !isDrawingLine ? polygon : [])}
        >
          <Layer id="event-polygon-fill" type="fill" paint={{ "fill-color": "rgba(147, 51, 234, 0.3)" }} />
          <Layer
            id="event-polygon-stroke"
            type="line"
            paint={{ "line-color": "#9333EA", "line-width": 0.7, "line-dasharray": [4, 2] }}
          />
        </Source>
        {/* Ruta en construcción. idPrefix propio: el RouteLayer de las direcciones puede estar montado
            a la vez y maplibre no admite dos sources con el mismo id. */}
        {isDrawingLine && line ? (
          <RouteLayer route={line} idPrefix="route-draft" color={ROUTE_COLOR} borderColor={ROUTE_BORDER_COLOR} />
        ) : null}
        {/* Ruta guardada que el usuario eligió en el panel. No convive con el dibujo: mientras se edita
            manda el borrador. */}
        {/* Se esconde en modo edición y en el flujo de ruta, para dejar el lienzo limpio; la selección se
            mantiene y la ruta vuelve al salir. Ojo: NO se usa `isCreatingPlace`, que incluye
            `hasPendingProposal` — basta con pins sueltos y un marcador custom seleccionado (cosa normal
            en debug) para que se encienda, y la ruta desaparecía sin motivo.
            Los lugares van en su propia capa y no por `setPlaces`: el efecto de filtros de sidebarCtx
            repisa `findPlaces` en cada refetch y los haría desaparecer solos. */}
        {!isPicking && !isForRoute && selectedRoute ? (
          <RouteMapLayer route={selectedRoute} places={selectedRoutePlaces} />
        ) : null}
        {routeFormPlaces.length > 0 ? <RoutePlacesLayer places={routeFormPlaces} idPrefix="route-draft" /> : null}
        <Source
          id="rect-preview"
          type="geojson"
          data={
            {
              type: "FeatureCollection",
              features: rectPreview
                ? [
                    {
                      type: "Feature",
                      properties: {},
                      geometry: { type: "Polygon", coordinates: [[...rectPreview, rectPreview[0]]] },
                    },
                  ]
                : [],
            } as GeoJSON.FeatureCollection
          }
        >
          <Layer id="rect-preview-fill" type="fill" paint={{ "fill-color": "rgba(1, 95, 255, 0.12)" }} />
          <Layer
            id="rect-preview-line"
            type="line"
            paint={{ "line-color": "#015FFF", "line-width": 1.5, "line-dasharray": [2, 2] }}
          />
        </Source>
        {/* Campus names removed from map; now shown via tag only */}
        <Source id="places" type="geojson" data={featuresToGeoJSON(labelFeatures)}>
          <Layer {...mapConfig.placesTextLayer} />
        </Source>
        <SilentErrorBoundary>
          <DebugMode />
        </SilentErrorBoundary>
        <PickingOverlay />
        <SilentErrorBoundary>
          <UserLocation />
        </SilentErrorBoundary>
        <DirectionsComponent />
        {(isCreatingPlace ? [] : points).map((place) => {
          const isEventPlace = eventPlaceIds.has(place.properties.identifier);
          const primaryCategory = isEventPlace
            ? CATEGORIES.EVENTS
            : ((place.properties.categories[0] ?? "Otros") as CATEGORIES);
          return (
            <Marker
              key={place.properties.identifier}
              place={place as PointFeature}
              onClick={() => {
                if (selectionLocked || isPicking) return;
                handlePlaceSelection(place, { openSidebar: true, flyMode: "ifOutside" });
              }}
              icon={<MarkerIcon label={primaryCategory} />}
              category={isEventPlace ? CATEGORIES.EVENTS : undefined}
            />
          );
        })}
        {pins.map((pin) => {
          const primaryCategory = (pin.properties.categories[0] ?? "Otros") as CATEGORIES;
          let config: HandlePlaceSelectionOptions;
          if (pins.length === 1) {
            config = { openSidebar: true, flyMode: "always" };
          } else {
            config = { openSidebar: false, flyMode: "never" };
          }
          return (
            <Marker
              key={pin.properties.identifier}
              place={pin as PointFeature}
              onClick={() => {
                if (wasDraggingRef.current || isViewOnly) return;
                if (isPicking) {
                  setSelectedPinId(pin.properties.identifier);
                } else if (!selectionLocked) {
                  handlePlaceSelection(pin, config);
                }
              }}
              icon={<MarkerIcon label={primaryCategory} />}
              draggable={!isViewOnly}
              onDrag={() => {
                wasDraggingRef.current = true;
              }}
              onDragEnd={(e: MarkerDragEvent) => {
                handlePinDrag(e, pin.properties.identifier);
                setTimeout(() => {
                  wasDraggingRef.current = false;
                }, 0);
              }}
            />
          );
        })}
        {isPicking && selectedPinId
          ? (() => {
              const selected = pins.find((p) => p.properties.identifier === selectedPinId);
              if (!selected) return null;
              return (
                <MapLibreMarker
                  longitude={selected.geometry.coordinates[0]}
                  latitude={selected.geometry.coordinates[1]}
                  offset={[16, -16]}
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    removePin(selectedPinId);
                    setSelectedPinId(null);
                  }}
                >
                  <div
                    role="button"
                    aria-label="Quitar punto"
                    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-destructive text-white shadow ring-1 ring-white"
                  >
                    <MaterialSymbol name="cancel" className="text-[14px]" />
                  </div>
                </MapLibreMarker>
              );
            })()
          : null}
      </Map>
    </div>
  );
}

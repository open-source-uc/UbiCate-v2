"use client";

import { use, useEffect, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { useMapPicking } from "@/app/context/mapPickingCtx";
import { pinsContext } from "@/app/context/pinsCtx";
import { useSidebar } from "@/app/context/sidebarCtx";
import { RouteFormData, useRouteForm } from "@/app/hooks/useRouteForm";
import { refreshRoutes } from "@/app/hooks/useRoutes";
import { normalizeIdentifier } from "@/lib/places/utils";
import { CATEGORIES, Feature, siglas } from "@/lib/types";

import * as Icons from "../../../ui/icons/icons";
import MaterialSymbol from "../../../ui/icons/MaterialSymbol";
import { DescriptionField } from "../../places/forms/descriptionField";
import { PlaceNameField } from "../../places/forms/placeNameField";

// El id de campus es la sigla (PK de la tabla campus y lo que traen los lugares en properties.campus).
// `siglas` traduce sigla → nombre para mostrar.
const CAMPUS_IDS = ["SJ", "CC", "LC", "OR", "VR"];

export default function RouteForm({
  onClose,
  onSuccess,
  defaultData,
  defaultCoords = [],
  method = "POST",
  submitButtonText = "Crear Ruta",
  title = "Nueva Ruta",
}: {
  onClose?: () => void;
  onSuccess?: () => void;
  defaultData?: RouteFormData;
  defaultCoords?: [number, number][];
  method?: "POST" | "PUT";
  submitButtonText?: string;
  title?: string;
}) {
  const { pins, clearPins, setPinsFromCoords } = use(pinsContext);
  const { isPicking, setPicking, setForRoute, setRoutePlaceIds } = useMapPicking();
  const { allFeatures } = useSidebar();
  const queryClient = useQueryClient();
  const [placeSearch, setPlaceSearch] = useState("");
  const [routeCoords, setRouteCoords] = useState<[number, number][]>(defaultCoords);

  const { data, setData, routeMutation, isLoading } = useRouteForm(method, defaultData, async () => {
    await refreshRoutes(queryClient);
    clearPins();
    onSuccess?.();
    onClose?.();
  });

  // Ruta nueva: se entra derecho a dibujar, primero la geometría y después los datos. Editando una
  // existente NO, que lo más común es corregir el nombre o los lugares; para eso está "Redibujar".
  useEffect(() => {
    setForRoute(true);
    if (defaultCoords.length > 0) {
      setPinsFromCoords(defaultCoords);
    } else {
      clearPins();
      setPicking(true, "line");
    }
    return () => setForRoute(false);
    // Init de una sola vez al abrir el formulario de ruta (entra en modo línea o restaura la geometría).
    // Con estas deps volvería a entrar en modo edición y perdería el trazo. Ver routes.md.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Al salir del modo edición se guarda la geometría. Con menos de 2 pins (Cancelar o Limpiar) no se
  // pisa la que ya tenía: Cancelar solo devuelve al formulario.
  const wasPickingRef = useRef(false);
  useEffect(() => {
    if (isPicking) {
      wasPickingRef.current = true;
      return;
    }
    if (!wasPickingRef.current) return;
    wasPickingRef.current = false;
    // Al salir del modo edición se guarda la geometría de la ruta. Con menos de 2 pins no se pisa la anterior.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pins.length >= 2) setRouteCoords(pins.map((p) => p.geometry.coordinates));
  }, [isPicking, pins]);

  // El mapa pinta los lugares asociados mientras se edita, así se ve por dónde pasa la ruta sin tener
  // que guardar. Se republican en cada cambio porque la lista se edita en vivo.
  useEffect(() => {
    setRoutePlaceIds(data.placeIds);
  }, [data.placeIds, setRoutePlaceIds]);

  const handleRedraw = () => {
    // El historial se reinicia al entrar al picking, así que los pins van ANTES.
    setPinsFromCoords(routeCoords);
    setPicking(true, "line");
  };

  const selectedPlaces: Feature[] = data.placeIds
    .map((id) => allFeatures.find((f) => normalizeIdentifier(f.properties.identifier) === normalizeIdentifier(id)))
    .filter((f): f is Feature => f !== undefined);

  const filteredPlaces =
    placeSearch.length >= 2
      ? allFeatures
          .filter(
            (f) =>
              !f.properties.categories.includes(CATEGORIES.CAMPUS) &&
              !data.placeIds.includes(f.properties.identifier) &&
              f.properties.name.toLowerCase().includes(placeSearch.toLowerCase()),
          )
          .slice(0, 10)
      : [];

  const handleAddPlace = (feature: Feature) => {
    setData((prev) => ({ ...prev, placeIds: [...prev.placeIds, feature.properties.identifier] }));
    setPlaceSearch("");
  };

  const handleRemovePlace = (identifier: string) => {
    setData((prev) => ({ ...prev, placeIds: prev.placeIds.filter((id) => id !== identifier) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    routeMutation.mutate({
      data: {
        name: data.name,
        information: data.information,
        campus: data.campus,
        placeIds: data.placeIds,
      },
      points: routeCoords.map((coordinates) => ({
        type: "Feature" as const,
        properties: {} as Record<string, never>,
        geometry: { type: "Point" as const, coordinates },
      })),
      identifier: defaultData?.identifier,
    });
  };

  const canSubmit = routeCoords.length >= 2 && data.name.trim().length > 0 && data.campus.length > 0 && !isLoading;

  return (
    <form className="space-y-4 text-md px-3 py-5" onSubmit={handleSubmit}>
      <button
        type="button"
        onClick={() => {
          clearPins();
          onClose?.();
        }}
        className="flex h-8 w-8 items-center justify-center cursor-pointer rounded-full bg-primary text-primary-foreground transition hover:bg-secondary hover:text-secondary-foreground"
        aria-label="Cerrar formulario"
      >
        <Icons.Close className="h-4 w-4 fill-background" />
      </button>
      <h1 className="text-2xl font-bold text-center text-foreground">{title}</h1>

      <div className="rounded-lg border border-border p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-foreground">
            {routeCoords.length >= 2 ? `Ruta de ${routeCoords.length} puntos` : "Sin ruta dibujada"}
          </span>
          <button
            type="button"
            onClick={handleRedraw}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-accent/10"
          >
            <MaterialSymbol name="route" className="text-[18px]" />
            {routeCoords.length >= 2 ? "Redibujar" : "Dibujar"}
          </button>
        </div>
        {routeCoords.length < 2 ? (
          <p className="text-xs text-muted-foreground">Marca al menos 2 puntos en el mapa para definir la ruta.</p>
        ) : null}
      </div>

      <PlaceNameField
        value={data.name}
        onChange={(value) => setData((prev) => ({ ...prev, name: value }))}
        disabled={isLoading}
        label="Nombre de la Ruta"
        placeholder="Ej: Recorrido de bienvenida, Ruta accesible..."
      />

      <div className="space-y-2">
        <label className="flex items-center justify-center text-md font-medium text-foreground" htmlFor="routeCampus">
          Campus
        </label>
        <select
          id="routeCampus"
          value={data.campus}
          onChange={(e) => setData((prev) => ({ ...prev, campus: e.target.value }))}
          className="block p-3 w-full text-sm rounded-lg border border-border bg-input text-foreground focus:ring-primary focus:outline-hidden focus:ring-2 disabled:opacity-50"
          disabled={isLoading}
          required
        >
          <option value="">Selecciona un campus</option>
          {CAMPUS_IDS.map((id) => (
            <option key={id} value={id}>
              {siglas.get(id) ?? id}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center justify-center text-md font-medium text-foreground" htmlFor="routePlaces">
          Lugares de la ruta
        </label>
        <input
          id="routePlaces"
          type="text"
          value={placeSearch}
          onChange={(e) => setPlaceSearch(e.target.value)}
          className="block p-3 w-full text-sm rounded-lg border border-border bg-input text-foreground focus:ring-primary focus:outline-hidden focus:ring-2"
          placeholder="Busca un lugar por su nombre..."
          disabled={isLoading}
        />

        {filteredPlaces.length > 0 ? (
          <ul className="max-h-48 overflow-auto rounded-lg border border-border divide-y divide-border">
            {filteredPlaces.map((f) => (
              <li key={f.properties.identifier}>
                <button
                  type="button"
                  onClick={() => handleAddPlace(f)}
                  className="w-full px-3 py-2 text-left text-sm text-foreground transition hover:bg-accent/10"
                >
                  {f.properties.name}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {siglas.get(f.properties.campus) ?? f.properties.campus}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {selectedPlaces.length > 0 ? (
          <ul className="space-y-1">
            {selectedPlaces.map((f) => (
              <li
                key={f.properties.identifier}
                className="flex items-center justify-between gap-2 rounded-lg bg-secondary/20 px-3 py-2"
              >
                <span className="text-sm text-foreground">{f.properties.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePlace(f.properties.identifier)}
                  className="text-xs text-muted-foreground underline transition hover:text-foreground"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground text-center">Aún no agregas lugares (es opcional).</p>
        )}
      </div>

      <DescriptionField
        value={data.information}
        onChange={(value) => setData((prev) => ({ ...prev, information: value }))}
        disabled={isLoading}
        hint="¿Qué recorre esta ruta?"
      />

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full p-3 rounded-lg bg-primary text-primary-foreground transition hover:bg-secondary hover:text-secondary-foreground focus:ring-primary focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Procesando..." : submitButtonText}
      </button>
    </form>
  );
}

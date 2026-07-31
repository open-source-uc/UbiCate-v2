"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { useMapPicking } from "@/app/context/mapPickingCtx";
import { pinsContext } from "@/app/context/pinsCtx";
import { useEventPlaceForm, EventFormData } from "@/app/hooks/useEventPlaceForm";
import { apiClient } from "@/lib/api/ubicateApiClient";
import { normalizeIdentifier } from "@/lib/places/utils";
import { EventLocation, Feature, siglas } from "@/lib/types";

import * as Icons from "../../../ui/icons/icons";

import { DescriptionField } from "./descriptionField";
import { Notification } from "./notification";
import { PlaceNameField } from "./placeNameField";
import { SubmitButton } from "./submitButton";

let locationIdCounter = 0;
function nextLocationId() {
  return `loc-${Date.now()}-${++locationIdCounter}`;
}

export default function EventPlaceForm({
  onClose,
  onSuccess,
  defaultData = {
    name: "",
    information: "",
    categories: ["events"],
    floors: [],
    startDate: "",
    endDate: "",
    locations: [],
  },
  method = "POST",
  submitButtonText = "Crear Evento",
  title = "Nuevo Evento",
}: {
  onClose?: () => void;
  onSuccess?: () => void;
  defaultData?: EventFormData;
  method?: "POST" | "PUT";
  submitButtonText?: string;
  title?: string;
}) {
  const { pins, clearPins } = use(pinsContext);
  const { isPicking, setPicking, setForEvent } = useMapPicking();
  const [parentSearch, setParentSearch] = useState("");
  const [selectedParentName, setSelectedParentName] = useState("");

  const { data, setData, notification, eventMutation, isLoading } = useEventPlaceForm(method, defaultData, () => {
    onSuccess?.();
    onClose?.();
  });

  const [locations, setLocations] = useState<EventLocation[]>(() => {
    if (!defaultData?.locations || defaultData.locations.length === 0) return [];
    return defaultData.locations;
  });
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const pickingFromUser = useRef(false);

  const { data: approvedData } = useQuery({
    queryKey: ["places"],
    queryFn: async () => {
      const response = await apiClient("/api/ubicate");
      return response;
    },
  });

  const approvedFeatures: Feature[] = useMemo(() => approvedData?.approved_places?.features || [], [approvedData]);

  const approvedById = useMemo(() => {
    const map = new Map<string, Feature>();
    for (const f of approvedFeatures) {
      map.set(normalizeIdentifier(f.properties.identifier), f);
    }
    return {
      get: (placeId: string) => map.get(normalizeIdentifier(placeId)),
    };
  }, [approvedFeatures]);

  const filteredParents =
    parentSearch.length >= 2
      ? approvedFeatures
          .filter((f) => f.properties.name.toLowerCase().includes(parentSearch.toLowerCase()))
          .slice(0, 10)
      : [];

  useEffect(() => {
    clearPins();
    if (method === "POST" && (defaultData?.locations?.length ?? 0) === 0) {
      setLocations([]);
    }
    setForEvent(true);
    return () => setForEvent(false);
  }, []);

  useEffect(() => {
    if (activeLocationId && !isPicking) {
      const loc = locations.find((l) => l.id === activeLocationId);
      if (loc && loc.type === "new") {
        setLocations((prev) => prev.map((l) => (l.id === activeLocationId ? { ...l, pins: [...pins] } : l)));
      }
      setActiveLocationId(null);
    }
  }, [isPicking]);

  const handleSelectParent = (feature: Feature) => {
    setLocations((prev) => [
      ...prev,
      {
        id: nextLocationId(),
        type: "existing",
        placeId: feature.properties.identifier,
        name: feature.properties.name,
        pins: [],
      },
    ]);
    setSelectedParentName("");
    setParentSearch("");
  };

  const handleRemoveLocation = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  const handleStartPicking = useCallback(() => {
    pickingFromUser.current = true;
    clearPins();
    setPicking(true, "point");
  }, [clearPins, setPicking]);

  useEffect(() => {
    if (!isPicking && pins.length > 0 && pickingFromUser.current) {
      pickingFromUser.current = false;
      setLocations((prev) => [
        ...prev,
        {
          id: nextLocationId(),
          type: "new",
          name: `Lugar ${prev.length + 1}`,
          information: "",
          pins: [...pins],
        },
      ]);
    }
  }, [isPicking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      data: {
        name: data.name,
        information: data.information,
        categories: data.categories,
        floors: data.floors,
        startDate: data.startDate,
        endDate: data.endDate,
        ...(data.showFrom ? { showFrom: data.showFrom } : {}),
      },
      locations: locations.map((l) => ({
        type: l.type,
        placeId: l.placeId,
        name: l.name,
        information: l.information,
        identifier: l.identifier,
        ...(typeof l.floor === "number" ? { floor: l.floor } : {}),
        points: l.type === "new" ? l.pins : [],
      })),
      identifier: defaultData?.identifier,
    };

    eventMutation.mutate(body as any);
  };

  const showParentSearch = !isPicking;

  return (
    <>
      <Notification notification={notification} />

      <form className="space-y-4 text-md px-3 py-5" onSubmit={handleSubmit}>
        <button
          onClick={() => onClose?.()}
          className="flex h-8 w-8 items-center text-background justify-center cursor-pointer rounded-full bg-primary text-primary-foreground transition hover:bg-secondary hover:text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Cerrar menú"
        >
          <Icons.Close className="h-4 w-4 fill-background" />
        </button>
        <h1 className="text-2xl font-bold text-center text-foreground">{title}</h1>

        <PlaceNameField
          value={data.name}
          onChange={(value) => setData((prev) => ({ ...prev, name: value }))}
          disabled={isLoading}
          label="Nombre del Evento"
          placeholder="Ej: Charla de ML, Hackathon, Conferencia..."
        />

        <div className="space-y-4">
          <label className="flex items-center justify-center text-md font-medium text-foreground">
            Fecha y hora de Inicio
          </label>
          <input
            type="datetime-local"
            value={data.startDate}
            onChange={(e) => setData((prev) => ({ ...prev, startDate: e.target.value }))}
            className="block p-3 w-full text-sm rounded-lg border border-border bg-input text-foreground focus:ring-primary focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-center text-md font-medium text-foreground">
            Fecha y hora de Fin
          </label>
          <input
            type="datetime-local"
            value={data.endDate}
            onChange={(e) => setData((prev) => ({ ...prev, endDate: e.target.value }))}
            className="block p-3 w-full text-sm rounded-lg border border-border bg-input text-foreground focus:ring-primary focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-center text-md font-medium text-foreground">
            Mostrar desde
            <span className="ml-2 text-xs text-muted-foreground font-normal">(opcional)</span>
          </label>
          <input
            type="datetime-local"
            value={data.showFrom || ""}
            onChange={(e) => setData((prev) => ({ ...prev, showFrom: e.target.value }))}
            className="block p-3 w-full text-sm rounded-lg border border-border bg-input text-foreground focus:ring-primary focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground text-center -mt-2">
            Si se completa, el evento se mostrará desde esta fecha aunque aún no haya iniciado.
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-center text-md font-medium text-foreground">
            Lugares del evento
          </label>

          {locations.map((loc, index) => {
            // Un lugar existente no se puede renombrar desde el evento: se muestra su nombre y campus reales
            const parent = loc.type === "existing" && loc.placeId ? approvedById.get(loc.placeId) : undefined;
            const parentCampus = parent ? siglas.get(parent.properties.campus) || parent.properties.campus : "";

            return (
              <div key={loc.id} className="flex items-center gap-2 p-3 rounded-lg border border-border bg-accent/5">
                <Icons.Map className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  {loc.type === "new" ? (
                    <input
                      type="text"
                      value={loc.name || ""}
                      onChange={(e) =>
                        setLocations((prev) => prev.map((l) => (l.id === loc.id ? { ...l, name: e.target.value } : l)))
                      }
                      className="block w-full text-sm p-1 rounded border border-border bg-input text-foreground focus:ring-primary focus:outline-hidden focus:ring-2"
                      placeholder={`Lugar ${index + 1}`}
                      disabled={isLoading}
                    />
                  ) : (
                    <span className="text-sm font-medium text-foreground truncate block">
                      {parent?.properties.name || loc.name || "Lugar existente"}
                    </span>
                  )}
                  {loc.type === "new" && loc.pins.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {loc.pins.length === 1
                        ? `${loc.pins[0].geometry.coordinates[0].toFixed(
                            4,
                          )}, ${loc.pins[0].geometry.coordinates[1].toFixed(4)}`
                        : `${loc.pins.length} puntos (polígono)`}
                    </span>
                  )}
                  {loc.type === "existing" && parentCampus ? (
                    <span className="text-xs text-muted-foreground">{parentCampus}</span>
                  ) : null}
                  <div className="mt-1 flex items-center gap-2">
                    <label className="text-xs text-muted-foreground shrink-0" htmlFor={`floor-${loc.id}`}>
                      Piso
                    </label>
                    <input
                      id={`floor-${loc.id}`}
                      type="number"
                      inputMode="numeric"
                      step={1}
                      value={loc.floor ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const floor = raw === "" ? undefined : Number.parseInt(raw, 10);
                        setLocations((prev) =>
                          prev.map((l) =>
                            l.id === loc.id ? { ...l, floor: Number.isNaN(floor as number) ? undefined : floor } : l,
                          ),
                        );
                      }}
                      className="w-20 text-sm p-1 rounded border border-border bg-input text-foreground focus:ring-primary focus:outline-hidden focus:ring-2"
                      placeholder="Opcional"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLocation(loc.id)}
                  className="text-sm text-destructive hover:underline shrink-0"
                  disabled={isLoading}
                >
                  Quitar
                </button>
              </div>
            );
          })}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStartPicking}
              className="flex-1 p-2.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isPicking}
            >
              Ubicar en mapa
            </button>
          </div>

          {showParentSearch ? (
            <div className="space-y-2">
              <p className="text-xs text-foreground/80 text-center italic">O busca un lugar existente para asociar</p>
              <div className="relative">
                <input
                  type="text"
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  className="block p-3 w-full text-sm rounded-lg border border-border bg-input text-foreground focus:ring-primary focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Buscar lugar..."
                  disabled={isLoading}
                />
                {filteredParents.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-40 overflow-auto">
                    {filteredParents.map((f) => (
                      <button
                        key={f.properties.identifier}
                        type="button"
                        onClick={() => handleSelectParent(f)}
                        className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent/10 cursor-pointer"
                      >
                        {f.properties.name}
                        <span className="text-xs text-foreground/60 ml-2">
                          ({siglas.get(f.properties.campus) || f.properties.campus})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <DescriptionField
          value={data.information}
          onChange={(value) => setData((prev) => ({ ...prev, information: value }))}
          disabled={isLoading}
          hint="¡Cuéntanos más sobre este evento!"
          showPreview={false}
        />

        <SubmitButton fallback="Procesando..." variant="primary">
          {submitButtonText}
        </SubmitButton>
      </form>
    </>
  );
}

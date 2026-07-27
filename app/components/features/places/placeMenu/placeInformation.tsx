import { useState, useEffect, useCallback, useMemo, type ElementType } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import EventPlaceForm from "@/app/components/features/places/forms/EventPlaceForm";
import { useMapPicking } from "@/app/context/mapPickingCtx";
import { apiClient } from "@/lib/api/ubicateApiClient";
import { allEvents } from "@/lib/places/eventsData";
import { normalizeIdentifier } from "@/lib/places/utils";
import {
  CATEGORIES,
  CategoryToDisplayName,
  EventFeature,
  EventLocation,
  EventProperties,
  Feature,
  getParentPlaceIds,
  isEventVisible,
  PointFeature,
  siglas,
} from "@/lib/types";
import { formatEventTag } from "@/lib/utils/time";

import { Button } from "../../../ui/button";
import * as Icons from "../../../ui/icons/icons";
import MarkDownComponent from "../../../ui/markDown";

import { SidebarLabel } from "./SidebarLabel";

type AvailableOption = {
  action: (() => void) | undefined;
  icon: ElementType | null;
  label: string;
};

export default function PlaceInformation({
  place,
  onClose,
  onEdit,
  onCreate,
  onDelete,
  onApprove,
  onReject,
}: {
  place: Feature;
  onClose?: () => void;
  onEdit?: () => void;
  onCreate?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const [isDebug, setIsDebug] = useState<boolean>(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [editingEvent, setEditingEvent] = useState<EventFeature | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const { isPicking } = useMapPicking();
  const queryClient = useQueryClient();

  const toggleEventExpand = useCallback((id: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const debugMode = sessionStorage.getItem("debugMode") === "true";
        setIsDebug(debugMode);
      }
    } catch (error) {
      console.warn("Unable to access sessionStorage:", error);
      setIsDebug(false);
    }
  }, []);

  const { data: approvedData } = useQuery({
    queryKey: ["places"],
    queryFn: async () => {
      const response = await apiClient("/api/ubicate");
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const approvedIdentifiers = useMemo(
    () =>
      new Set(
        (approvedData?.approved_places?.features || []).map((f: Feature) =>
          normalizeIdentifier(f.properties.identifier),
        ),
      ),
    [approvedData],
  );

  const eventPlaceMap = useMemo(() => {
    const map = new Map<string, Feature>();
    for (const item of allEvents) {
      if ((item as any).properties?.startDate) continue;
      map.set(normalizeIdentifier(item.properties.identifier), item as unknown as Feature);
    }
    return map;
  }, [allEvents]);

  function buildLocationsFromParentIds(parentIds: string[]): EventLocation[] {
    return parentIds.map((id) => {
      const normId = normalizeIdentifier(id);
      if (approvedIdentifiers.has(normId)) {
        return { id: `existing-${id}`, type: "existing" as const, placeId: id, pins: [] };
      }
      const placeFeature = eventPlaceMap.get(normId);
      if (placeFeature) {
        const pins: PointFeature[] = [];
        if (placeFeature.geometry.type === "Point") {
          pins.push({
            type: "Feature",
            properties: {} as any,
            geometry: { type: "Point", coordinates: placeFeature.geometry.coordinates as [number, number] },
          });
        } else if (placeFeature.geometry.type === "Polygon") {
          const coords = (placeFeature.geometry.coordinates as [number, number][][])[0].slice(0, -1);
          for (const c of coords) {
            pins.push({ type: "Feature", properties: {} as any, geometry: { type: "Point", coordinates: c } });
          }
        }
        return {
          id: `new-${id}`,
          type: "new" as const,
          name: placeFeature.properties.name,
          information: placeFeature.properties.information || "",
          identifier: placeFeature.properties.identifier,
          pins,
        };
      }
      return { id: `existing-${id}`, type: "existing" as const, placeId: id, pins: [] };
    });
  }
  const isEventFeature = "startDate" in place.properties;

  const approvedPlaceMap = useMemo(() => {
    const map = new Map<string, Feature>();
    for (const f of (approvedData?.approved_places?.features || []) as Feature[]) {
      map.set(normalizeIdentifier(f.properties.identifier), f);
    }
    return map;
  }, [approvedData]);

  const displayTitle = useMemo(() => {
    if (!isEventFeature) return place.properties.name;
    const currentEvent = allEvents.find((e) => e.properties.identifier === place.properties.identifier);
    const props = (currentEvent || place).properties;
    const parentIds = getParentPlaceIds(props as EventProperties);
    for (const id of parentIds) {
      const normId = normalizeIdentifier(id);
      const locFeature = eventPlaceMap.get(normId);
      if (locFeature) return locFeature.properties.name;
      const approvedFeature = approvedPlaceMap.get(normId);
      if (approvedFeature) return approvedFeature.properties.name;
    }
    return place.properties.name;
  }, [isEventFeature, place, allEvents, eventPlaceMap, approvedPlaceMap]);

  const associatedEvents = useMemo(() => {
    const events = allEvents.filter((ev) => {
      const ids = getParentPlaceIds(ev.properties);
      return ids.includes(place?.properties.identifier || "");
    });
    if (isEventFeature) {
      const ev = allEvents.find((e) => e.properties.identifier === place.properties.identifier);
      if (ev && !events.some((e) => e.properties.identifier === ev.properties.identifier)) {
        events.unshift(ev);
      }
    }
    return events;
  }, [allEvents, place, isEventFeature]);

  const now = new Date();
  const activeAssociatedEvents = isDebug
    ? associatedEvents
    : associatedEvents.filter((ev) => isEventVisible(ev.properties, now));

  const deleteEventMutation = useMutation({
    mutationFn: (identifier: string) =>
      apiClient("/api/events", {
        method: "DELETE",
        body: { identifier },
      }),
    onSuccess: () => {
      alert("El evento fue eliminado");
      document.location.reload();
    },
    onError: (error: Error) => {
      alert("Hubo un error: " + error.message);
    },
  });

  const handleDeleteEvent = (event: EventFeature) => {
    const confirmacion = confirm("¿Estás seguro de eliminar este evento?") ?? false;
    if (!confirmacion) return;
    deleteEventMutation.mutate(event.properties.identifier);
  };

  const handleEditEvent = (event: EventFeature) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    try {
      if (navigator.share) {
        await navigator.share({
          url: window.location.href,
        });
        return;
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href);
        console.log("Enlace copiado al portapapeles");
        return;
      }

      console.warn("Las opciones de compartir no están disponibles en este navegador.");
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  const isCustomMark = place?.properties.categories.includes(CATEGORIES.CUSTOM_MARK);
  const needsApproval = place.properties.needApproval === true;
  const isEventCreatedPlace = eventPlaceMap.has(normalizeIdentifier(place.properties.identifier));

  const availableOptions: AvailableOption[] = [];

  if (!isEventCreatedPlace) {
    if (isCustomMark) {
      availableOptions.push({ action: onCreate, icon: Icons.Edit, label: "Agregar" });
    } else {
      availableOptions.push({ action: onEdit, icon: Icons.Edit, label: "Editar" });
    }
  }

  if (isDebug && !isCustomMark && !isEventCreatedPlace) {
    if (needsApproval) {
      availableOptions.push({ action: onApprove, icon: null, label: "Aprobar" });
      availableOptions.push({ action: onReject, icon: null, label: "Rechazar" });
    } else {
      availableOptions.push({ action: onDelete, icon: null, label: "Eliminar" });
    }
  }

  const categoryLabel = place.properties?.categories?.[0]
    ? CategoryToDisplayName.get(place.properties.categories[0] as CATEGORIES) || "Lugar sin categoría"
    : null;
  const campusDisplayName = siglas.get(place.properties.campus) || "UC";
  const campusDescription = place.properties.information;
  const campusAriaLabel = `Campus ${campusDisplayName}`;
  const categoryAriaLabel = categoryLabel ? `Categoría ${categoryLabel}` : undefined;

  const renderInfoRow = (Icon: ElementType, label: string, value: string) => (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-accent/5 px-3 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4 fill-primary" />
        </span>
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium text-muted-foreground text-right">{value}</span>
    </div>
  );

  const renderOptionControl = () => {
    if (availableOptions.length === 0) return null;

    if (availableOptions.length === 1) {
      const singleOption = availableOptions[0];
      const SingleIcon = singleOption.icon;

      return (
        <Button
          onClick={() => singleOption.action?.()}
          aria-label={singleOption.label}
          variant="mapSecondary"
          className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl"
        >
          {SingleIcon ? <SingleIcon className="h-4 w-4" /> : <Icons.Options className="h-4 w-4" />}
          <span className="text-xs font-semibold">{singleOption.label}</span>
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Más opciones para este lugar"
            variant="mapSecondary"
            className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg"
          >
            <Icons.Options className="h-4 w-4" />
            <span className="text-xs font-semibold">Más</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[70] min-w-[12rem] rounded-xl border border-border bg-popover p-2 shadow-xl">
          {availableOptions.map((option, index) => {
            const OptionIcon = option.icon;
            const showSeparator = index < availableOptions.length - 1 && option.label === "Editar";

            return (
              <div key={`${option.label}-${index}`}>
                <DropdownMenuItem
                  onClick={() => option.action?.()}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground focus:bg-accent focus:outline-none"
                >
                  {OptionIcon ? <OptionIcon className="h-4 w-4" /> : null}
                  <span>{option.label}</span>
                </DropdownMenuItem>
                {showSeparator ? <DropdownMenuSeparator className="mx-2 my-1 bg-border" /> : null}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-border px-4 pb-3 pt-4">
        <section className="space-y-3 max-w-[70%]">
          <div>
            <h3 className="text-xl font-bold leading-tight text-foreground">{displayTitle}</h3>
            <p className="text-xs font-medium text-muted-foreground">Descúbre más sobre este lugar.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SidebarLabel icon={Icons.Map} variant="primary" ariaLabel={campusAriaLabel}>
              {campusDisplayName}
            </SidebarLabel>
            {categoryLabel ? (
              <SidebarLabel icon={Icons.MenuBook} variant="muted" ariaLabel={categoryAriaLabel}>
                {categoryLabel}
              </SidebarLabel>
            ) : null}
          </div>
        </section>

        <button
          onClick={() => onClose?.()}
          className="flex h-8 w-8 items-center text-background justify-center cursor-pointer rounded-full bg-primary text-primary-foreground transition hover:bg-secondary hover:text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Cerrar menú"
        >
          <Icons.Close className="h-4 w-4 fill-background" />
        </button>
      </header>

      <section className="flex-1 overflow-y-auto">
        <div className="flex h-full flex-col gap-6 px-4 pb-6 pt-5">
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleShare}
              aria-label="Compartir esta ubicación"
              variant="mapPrimary"
              className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl"
            >
              <Icons.Share className="h-5 w-5 fill-background" />
              <span className="text-xs font-semibold tracking-wide">Compartir</span>
            </Button>

            {renderOptionControl()}
          </div>

          {activeAssociatedEvents.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground">Eventos</h4>
              {activeAssociatedEvents.map((event) => {
                const start = new Date(event.properties.startDate);
                const end = new Date(event.properties.endDate);
                const formatDate = (d: Date) =>
                  d.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
                const formatTime = (d: Date) => d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
                const expanded = expandedEvents.has(event.properties.identifier);

                return (
                  <div
                    key={event.properties.identifier}
                    className="relative rounded-xl border border-border/60 bg-chart-events/10 overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-chart-events rounded-l-xl" />

                    <div className="pl-4 pr-3 pt-2 pb-3">
                      <div className="flex items-center justify-between">
                        {(() => {
                          const tag = formatEventTag(
                            event.properties.startDate,
                            event.properties.endDate,
                            now,
                            isDebug ? Infinity : undefined,
                          );
                          return tag ? (
                            <span className="inline-block mb-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-chart-events/15 text-chart-events">
                              {tag}
                            </span>
                          ) : null;
                        })()}
                        {isDebug ? (
                          <div className="flex items-center gap-1 mb-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditEvent(event)}
                              className="p-1 rounded-md hover:bg-chart-events/15 text-chart-events/70 hover:text-chart-events transition cursor-pointer focus:outline-none"
                              aria-label="Editar evento"
                            >
                              <Icons.Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(event)}
                              className="p-1 rounded-md hover:bg-destructive/15 text-destructive/70 hover:text-destructive transition cursor-pointer focus:outline-none"
                              aria-label="Eliminar evento"
                            >
                              <Icons.Delete className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <h5
                        className={`text-sm font-bold text-foreground leading-snug mb-2 ${
                          expanded ? "" : "line-clamp-1"
                        }`}
                      >
                        {event.properties.name}
                      </h5>

                      <div className="flex gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-events/15 text-chart-events shrink-0">
                          <Icons.Event className="h-4 w-4" />
                        </span>
                        <div className="flex flex-col justify-center gap-0.5 text-xs">
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground/60">Inicio</span> {formatDate(start)},{" "}
                            {formatTime(start)}
                          </span>
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground/60">Fin</span> {formatDate(end)},{" "}
                            {formatTime(end)}
                          </span>
                        </div>
                      </div>

                      {event.properties.information ? (
                        <div
                          className={`mt-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground leading-relaxed ${
                            expanded ? "" : "hidden"
                          }`}
                        >
                          <MarkDownComponent>{event.properties.information}</MarkDownComponent>
                        </div>
                      ) : null}

                      {event.properties.information || event.properties.name.length > 40 ? (
                        <div className="flex justify-end mt-1.5">
                          <button
                            type="button"
                            onClick={() => toggleEventExpand(event.properties.identifier)}
                            className="text-xs text-chart-events hover:underline cursor-pointer focus:outline-none focus:ring-0"
                          >
                            {expanded ? "Ver menos" : "Ver más"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-3">
            {place.properties?.floors && place.properties.floors.length > 0
              ? renderInfoRow(Icons.Floor, "Piso", place.properties.floors.join(", "))
              : null}

            {place.properties?.campus
              ? renderInfoRow(Icons.Map, "Campus", siglas.get(place.properties.campus) ?? place.properties.campus)
              : null}
          </div>

          {place.properties.information ? (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground">Descripción</h4>
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                <MarkDownComponent>{place.properties.information}</MarkDownComponent>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {showEventForm && editingEvent ? (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 pointer-events-auto ${
            isPicking ? "hidden" : ""
          }`}
        >
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
            <EventPlaceForm
              defaultData={{
                name: editingEvent.properties.name,
                information: editingEvent.properties.information,
                categories: editingEvent.properties.categories,
                floors: editingEvent.properties.floors || [],
                startDate: editingEvent.properties.startDate,
                endDate: editingEvent.properties.endDate,
                showFrom: editingEvent.properties.showFrom || "",
                locations: buildLocationsFromParentIds(getParentPlaceIds(editingEvent.properties)),
                identifier: editingEvent.properties.identifier,
              }}
              method="PUT"
              submitButtonText="Actualizar Evento"
              title="Editar Evento"
              onClose={() => {
                setShowEventForm(false);
                setEditingEvent(null);
              }}
              onSuccess={() => {
                document.location.reload();
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

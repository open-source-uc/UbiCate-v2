"use client";

import { useSearchParams } from "next/navigation";

import { useMemo, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

import * as Icons from "@/app/components/ui/icons/icons";
import MaterialSymbol from "@/app/components/ui/icons/MaterialSymbol";
import { useSidebar } from "@/app/context/sidebarCtx";
import { useDebugMode } from "@/app/hooks/useDebugMode";
import { deleteRouteRequest, refreshRoutes } from "@/app/hooks/useRoutes";
import { emitFlyToEvent } from "@/lib/events/customEvents";
import { RouteFeature, siglas } from "@/lib/types";

import RouteForm from "../../routes/forms/RouteForm";
import { routeColors } from "../../routes/routeMapLayer";

interface RoutesPanelProps {
  onClose: () => void;
}

// El campus circula en dos formatos: sigla ("SJ", lo que guardan las rutas) y nombre largo
// ("SanJoaquin", lo que pone ?campus=). `siglas` traduce el largo a sigla.
function toCampusSigla(value: string | null): string | null {
  if (!value) return null;
  if (value.length === 2) return value.toUpperCase();
  return siglas.get(value) ?? null;
}

export default function RoutesPanel({ onClose }: RoutesPanelProps) {
  const isDebugMode = useDebugMode();
  const { routes, isDataLoaded, selectedRoute, setSelectedRoute, activeFilters, setActiveFilters, openRoutesPanel } =
    useSidebar();
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteFeature | null>(null);
  const selectedId = selectedRoute?.properties.identifier ?? null;

  const currentCampus = useMemo(() => {
    const fromParam = toCampusSigla(params.get("campus"));
    if (fromParam) return fromParam;
    if (typeof window === "undefined") return null;
    try {
      return toCampusSigla(localStorage.getItem("defaultCampus"));
    } catch {
      return null;
    }
  }, [params]);

  // Sin campus reconocible se muestran todas: mejor de más que una lista vacía sin explicación.
  // La seleccionada va siempre, aunque sea de otro campus: si no, se dibuja en el mapa pero su detalle
  // no aparece en ninguna parte (por ejemplo al llegar clickeando su línea).
  const visibleRoutes = currentCampus
    ? routes.filter((r) => r.properties.campus === currentCampus || r.properties.identifier === selectedId)
    : routes;

  const clearSelection = () => setSelectedRoute(null);

  // Dibuja la ruta y centra el mapa en ella. Lo comparten el clic en el ítem y "Ver detalle".
  const drawRoute = (route: RouteFeature) => {
    // Un filtro de categorías activo llena el mapa de marcadores encima de la ruta: al elegir una ruta
    // se apagan las pills para dejar el recorrido y sus lugares solos.
    if (activeFilters.length > 0) setActiveFilters([]);

    setSelectedRoute(route);

    const coords = route.geometry.coordinates;
    if (coords.length > 0) {
      const lng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
      const lat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
      emitFlyToEvent(lng, lat, 16);
    }
  };

  const handleSelectRoute = (route: RouteFeature) => {
    if (selectedId === route.properties.identifier) {
      clearSelection();
      return;
    }
    drawRoute(route);
  };

  const handleShowDetail = (route: RouteFeature) => {
    // Se dibuja además de abrir la ficha: si no, el detalle describiría una ruta que no está en el mapa.
    drawRoute(route);
    // ⚠️ Va DESPUÉS de drawRoute a propósito: `setSelectedRoute` es `selectRoute`, que limpia
    // `routeDetail`. Al revés, la ficha se abriría vacía y caería en el respaldo de `selectedRoute`.
    openRoutesPanel(route);
  };

  const handleDelete = async (route: RouteFeature) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar la ruta?",
      text: `Se eliminará "${route.properties.name}". Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmed.isConfirmed) return;

    try {
      const result = await deleteRouteRequest(route.properties.identifier);
      await refreshRoutes(queryClient);
      if (selectedId === route.properties.identifier) clearSelection();
      await Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: result?.message || "Ruta eliminada",
        confirmButtonText: "Entendido",
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.data?.message || error.message || "No se pudo eliminar la ruta",
      });
    }
  };

  if (isCreating || editingRoute) {
    return (
      <div className="flex flex-col h-full overflow-auto">
        <RouteForm
          method={editingRoute ? "PUT" : "POST"}
          title={editingRoute ? "Editar Ruta" : "Nueva Ruta"}
          submitButtonText={editingRoute ? "Guardar cambios" : "Crear Ruta"}
          defaultData={
            editingRoute
              ? {
                  name: editingRoute.properties.name,
                  information: editingRoute.properties.information,
                  campus: editingRoute.properties.campus,
                  placeIds: editingRoute.properties.placeIds,
                  color: editingRoute.properties.color ?? "",
                  identifier: editingRoute.properties.identifier,
                }
              : undefined
          }
          defaultCoords={editingRoute ? editingRoute.geometry.coordinates : []}
          onClose={() => {
            setIsCreating(false);
            setEditingRoute(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-bold text-lg text-foreground">Rutas</h3>
            <p className="text-xs text-muted-foreground">Recorre la UC con nuestras rutas</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-primary flex items-center justify-center rounded-full cursor-pointer group hover:bg-secondary transition"
          aria-label="Cerrar menú"
        >
          <Icons.Close className="w-4 h-4 fill-background group-hover:fill-secondary-foreground" />
        </button>
      </div>

      {isDebugMode ? (
        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-secondary hover:text-secondary-foreground"
          >
            <MaterialSymbol name="route" className="text-[20px]" />
            Crear Ruta
          </button>
        </div>
      ) : null}

      {visibleRoutes.length > 0 ? (
        <ul className="flex-1 overflow-auto px-4 py-4 space-y-2">
          {visibleRoutes.map((route) => (
            <li
              key={route.properties.identifier}
              className={`rounded-lg border px-3 py-2 transition ${
                selectedId === route.properties.identifier ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <button
                type="button"
                onClick={() => handleSelectRoute(route)}
                className="flex w-full items-center gap-3 text-left cursor-pointer"
                aria-pressed={selectedId === route.properties.identifier}
              >
                {/* Mismo color con el que se dibuja la ruta en el mapa, para reconocerla en la lista. */}
                <span
                  className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: routeColors(route.properties.color).color,
                    border: `1px solid ${routeColors(route.properties.color).borderColor}`,
                  }}
                >
                  <MaterialSymbol name="route" className="text-[20px] text-background" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{route.properties.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {siglas.get(route.properties.campus) ?? route.properties.campus}
                    {route.properties.placeIds.length > 0 ? ` · ${route.properties.placeIds.length} lugares` : ""}
                  </p>
                </div>
              </button>
              {isDebugMode ? (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // La ruta que quede dibujada sería la versión previa a los cambios.
                      if (selectedId === route.properties.identifier) clearSelection();
                      setEditingRoute(route);
                    }}
                    className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground transition hover:bg-accent/10"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(route)}
                    className="flex-1 rounded-lg border border-destructive px-3 py-1.5 text-xs text-destructive transition hover:bg-destructive/10"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                // Solo en modo normal: en debug la fila la ocupan Editar y Eliminar.
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleShowDetail(route)}
                    className="w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-secondary hover:text-secondary-foreground"
                  >
                    Ver detalle
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <section className="flex-1 px-4 pt-8 pb-8 flex flex-col items-center text-center gap-3">
          <span className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <MaterialSymbol name="route" className="text-[28px] text-background" />
          </span>
          <p className="font-semibold text-foreground">
            {!isDataLoaded ? "Cargando rutas…" : routes.length > 0 ? "Sin rutas en este campus" : "Próximamente"}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            {routes.length > 0
              ? "Todavía no hay rutas para el campus que estás viendo. Cambia de campus para ver las demás."
              : "Estamos trabajando en las rutas dentro del campus. Pronto vas a poder ver nuestras propuestas para recorrer el campus."}
          </p>
        </section>
      )}
    </div>
  );
}

"use client";

import { QueryClient, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/ubicateApiClient";
import { RouteFeature } from "@/lib/types";

export const ROUTES_QUERY_KEY = ["routes"];
export const ROUTES_DEBUG_QUERY_KEY = ["routes-debug"];

const STALE_TIME_MS = 5 * 60 * 1000;

async function fetchRoutes(fresh: boolean): Promise<RouteFeature[]> {
  const response = await apiClient("/api/routes", fresh ? { headers: { "X-Ubicate-Fresh": "true" } } : undefined);
  return response?.routes?.features ?? [];
}

/**
 * La query `["routes"]` se define en `sidebarCtx`, junto a lugares y eventos: así entra en el flujo de 3
 * capas (SW + offlineFirst + refetch adaptativo) y se carga al abrir la app, no al abrir el panel.
 * Acá viven solo el refresco post-mutación, la variante de debug y el DELETE.
 *
 * ⚠️ No declares otro `useQuery(["routes"])` con distinto `queryFn`: dos definiciones del mismo query
 * key es un footgun (gana la que monte primero).
 */

/**
 * Tras mutar hay que traer los datos con `X-Ubicate-Fresh`: un invalidate a secas vuelve a pasar por el
 * StaleWhileRevalidate del service worker y puede devolver la lista sin la ruta recién escrita.
 */
export async function refreshRoutes(queryClient: QueryClient): Promise<void> {
  const fresh = await fetchRoutes(true);
  // La query de sidebarCtx guarda la respuesta completa del endpoint, no el array pelado.
  queryClient.setQueryData(ROUTES_QUERY_KEY, { routes: { features: fresh }, message: "Success" });
  queryClient.invalidateQueries({ queryKey: ROUTES_DEBUG_QUERY_KEY });
}

/** Debug = siempre fresco: nunca cache, ni del SW ni de la Capa 1 del servidor. */
export function useRoutesDebug(enabled: boolean) {
  const { data } = useQuery({
    queryKey: ROUTES_DEBUG_QUERY_KEY,
    queryFn: () => fetchRoutes(true),
    enabled,
    staleTime: STALE_TIME_MS,
  });

  return data ?? [];
}

export async function deleteRouteRequest(identifier: string): Promise<{ message?: string }> {
  return await apiClient("/api/routes", { method: "DELETE", body: { identifier } });
}

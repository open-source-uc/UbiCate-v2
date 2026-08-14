"use client";

import { QueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/ubicateApiClient";
import { RouteFeature } from "@/lib/types";

export const ROUTES_QUERY_KEY = ["routes"];

async function fetchRoutes(fresh: boolean): Promise<RouteFeature[]> {
  const response = await apiClient("/api/routes", fresh ? { headers: { "X-Ubicate-Fresh": "true" } } : undefined);
  return response?.routes?.features ?? [];
}

/**
 * La query `["routes"]` se define en `sidebarCtx`, junto a lugares y eventos: así entra en el flujo de 3
 * capas (SW + offlineFirst + refetch adaptativo) y se carga al abrir la app, no al abrir el panel.
 * Acá viven solo el refresco post-mutación y el DELETE.
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
}

export async function deleteRouteRequest(identifier: string): Promise<{ message?: string }> {
  return await apiClient("/api/routes", { method: "DELETE", body: { identifier } });
}

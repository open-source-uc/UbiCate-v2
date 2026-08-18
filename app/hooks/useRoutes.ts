"use client";

import { QueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/ubicateApiClient";
import { RouteFeature } from "@/lib/types";

export const ROUTES_QUERY_KEY = ["routes"];

/**
 * `fresh` salta el cache del SW **y** la Capa 1 del servidor (lee de la BD): para ver la propia
 * escritura tras mutar. `revalidate` salta solo el cache del SW y se sirve de la Capa 1: es el modo
 * de la carga y la reconexión, que recorren todos los usuarios.
 */
export type RoutesCacheMode = "fresh" | "revalidate";

async function fetchRoutes(mode: RoutesCacheMode): Promise<RouteFeature[]> {
  const header = mode === "fresh" ? "X-Ubicate-Fresh" : "X-Ubicate-Revalidate";
  const response = await apiClient("/api/routes", { headers: { [header]: "true" } });
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
 * Un invalidate a secas vuelve a pasar por el StaleWhileRevalidate del service worker y puede devolver
 * la lista sin la ruta recién escrita, así que siempre se refresca con header.
 *
 * El default `"fresh"` es el caso post-mutación. `sidebarCtx` lo llama con `"revalidate"` en la carga
 * y la reconexión, donde no hay que golpear la BD.
 */
export async function refreshRoutes(queryClient: QueryClient, mode: RoutesCacheMode = "fresh"): Promise<void> {
  const fresh = await fetchRoutes(mode);
  // La query de sidebarCtx guarda la respuesta completa del endpoint, no el array pelado.
  queryClient.setQueryData(ROUTES_QUERY_KEY, { routes: { features: fresh }, message: "Success" });
}

export async function deleteRouteRequest(identifier: string): Promise<{ message?: string }> {
  return await apiClient("/api/routes", { method: "DELETE", body: { identifier } });
}

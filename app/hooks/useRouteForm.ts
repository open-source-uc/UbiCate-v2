import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";

import { apiClient } from "@/lib/api/ubicateApiClient";

export interface RouteFormData {
  name: string;
  information: string;
  campus: string;
  placeIds: string[];
  /** Hex "#rrggbb" con el que se dibuja la ruta. "" = el verde por defecto. */
  color: string;
  identifier?: string;
}

// La geometría viaja como puntos sueltos, igual que en lugares y eventos; el servidor arma la
// LineString respetando el orden.
export interface RoutePoint {
  type: "Feature";
  properties: Record<string, never>;
  geometry: { type: "Point"; coordinates: [number, number] };
}

export interface CreateRoute {
  data: Omit<RouteFormData, "identifier">;
  points: RoutePoint[];
  identifier?: string;
}

async function createRoute(body: CreateRoute) {
  return await apiClient("/api/routes", {
    method: "POST",
    body: body,
  });
}

async function updateRoute(body: CreateRoute) {
  return await apiClient("/api/routes", {
    method: "PUT",
    body: body,
  });
}

export function useRouteForm(method: "POST" | "PUT", defaultData?: RouteFormData, onClose?: () => void) {
  const [data, setData] = useState<Omit<RouteFormData, "identifier">>(
    defaultData
      ? {
          name: defaultData.name,
          information: defaultData.information,
          campus: defaultData.campus,
          placeIds: defaultData.placeIds || [],
          color: defaultData.color || "",
        }
      : {
          name: "",
          information: "",
          campus: "",
          placeIds: [],
          color: "",
        },
  );

  const routeMutation = useMutation({
    mutationFn: (body: CreateRoute) => {
      return method === "POST" ? createRoute(body) : updateRoute(body);
    },
    onSuccess: async (result: { message?: string }) => {
      // Las rutas son admin-only y se publican de inmediato (sin aprobación).
      await Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: result?.message || (method === "POST" ? "Ruta creada" : "Ruta actualizada"),
        confirmButtonText: "Entendido",
      });
      onClose?.();
    },
    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.data?.message || error.message || "Ha ocurrido un error",
      });
    },
  });

  return {
    data,
    setData,
    routeMutation,
    isLoading: routeMutation.isPending,
  };
}

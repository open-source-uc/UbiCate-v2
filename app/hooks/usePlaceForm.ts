"use client";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

import { apiClient } from "@/lib/api/ubicateApiClient";
import { PointFeature } from "@/lib/types";

interface PlaceFormData {
  name: string;
  information: string;
  categories: string[];
  floors: (number | "")[];
  identifier?: string;
}

interface CreatePlace {
  data: Omit<PlaceFormData, "identifier">;
  points: Array<PointFeature>;
  identifier?: string;
}

async function createPlace(body: CreatePlace) {
  return await apiClient("/api/ubicate", {
    method: "POST",
    body: body,
  });
}

async function updatePlace(body: CreatePlace) {
  return await apiClient("/api/ubicate", {
    method: "PUT",
    body: body,
  });
}
export function usePlaceForm(method: "POST" | "PUT", defaultData?: PlaceFormData, onClose?: () => void) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Omit<PlaceFormData, "identifier">>(
    defaultData
      ? {
          name: defaultData.name,
          information: defaultData.information,
          categories: defaultData.categories,
          floors: defaultData.floors,
        }
      : {
          name: "",
          information: "",
          categories: [""],
          floors: [],
        },
  );

  const placeMutation = useMutation({
    mutationFn: (body: CreatePlace) => {
      return method === "POST" ? createPlace(body) : updatePlace(body);
    },
    onSuccess: async (result: { message?: string }) => {
      try {
        const res = await fetch("/api/ubicate", {
          headers: { "X-Ubicate-Fresh": "true" },
        });
        const freshData = await res.json();
        queryClient.setQueryData(["places"], freshData);
        queryClient.invalidateQueries({ queryKey: ["ubicate-debug"] });
      } catch {
        // offline — continue with cached data
      }

      // Crear/editar NO es una actualización directa: genera una PROPUESTA que un administrador debe
      // aprobar (tanto en modo normal como en debug). Preferimos el mensaje del servidor, que ya explica
      // el flujo de aprobación según el caso (lugar nuevo / pendiente / propuesta de edición).
      await Swal.fire({
        icon: "success",
        title: "¡Propuesta enviada!",
        text:
          result?.message ??
          (method === "POST"
            ? "La ubicación fue propuesta. Un administrador debe aprobarla antes de que aparezca en el mapa."
            : "La edición fue propuesta. Un administrador debe aprobarla antes de que se aplique."),
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
    placeMutation,
    isLoading: placeMutation.isPending,
  };
}

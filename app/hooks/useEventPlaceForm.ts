import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";

import { apiClient } from "@/lib/api/ubicateApiClient";
import { EventLocation, PointFeature } from "@/lib/types";

export interface EventFormData {
  name: string;
  information: string;
  categories: string[];
  floors: number[];
  startDate: string;
  endDate: string;
  showFrom?: string;
  locations: EventLocation[];
  identifier?: string;
}

export interface CreateEvent {
  data: Omit<EventFormData, "identifier">;
  points: Array<PointFeature>;
  identifier?: string;
}

async function createEvent(body: CreateEvent) {
  return await apiClient("/api/events", {
    method: "POST",
    body: body,
  });
}

async function updateEvent(body: CreateEvent) {
  return await apiClient("/api/events", {
    method: "PUT",
    body: body,
  });
}

export function useEventPlaceForm(
  method: "POST" | "PUT",
  defaultData?: EventFormData & { identifier?: string },
  onClose?: () => void,
) {
  const [data, setData] = useState<Omit<EventFormData, "identifier">>(
    defaultData
      ? {
          name: defaultData.name,
          information: defaultData.information,
          categories: defaultData.categories,
          floors: defaultData.floors,
          startDate: defaultData.startDate,
          endDate: defaultData.endDate,
          showFrom: defaultData.showFrom || "",
          locations: defaultData.locations || [],
        }
      : {
          name: "",
          information: "",
          categories: ["events"],
          floors: [],
          startDate: "",
          endDate: "",
          showFrom: "",
          locations: [],
        },
  );

  const eventMutation = useMutation({
    mutationFn: (body: CreateEvent) => {
      return method === "POST" ? createEvent(body) : updateEvent(body);
    },
    onSuccess: async (result: { message?: string }) => {
      // Los eventos son admin-only y se publican de inmediato (sin aprobación).
      await Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: result?.message || (method === "POST" ? "Evento creado" : "Evento actualizado"),
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
    eventMutation,
    isLoading: eventMutation.isPending,
  };
}

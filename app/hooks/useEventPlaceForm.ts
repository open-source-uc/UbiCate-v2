import { useState, useEffect } from "react";

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/ubicateApiClient";
import { EventLocation, PointFeature } from "@/lib/types";

import { NotificationState } from "../components/features/places/forms/notification";

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
  const [notification, setNotification] = useState<NotificationState | null>(null);
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
    onSuccess: () => {
      setNotification({
        type: "success",
        message: method === "POST" ? "Evento creado" : "Evento actualizado",
        visible: true,
      });

      setTimeout(() => {
        onClose?.();
      }, 2000);
    },
    onError: (error: any) => {
      setNotification({
        type: "error",
        message: error.data?.message || error.message || "Ha ocurrido un error",
        visible: true,
      });
    },
  });

  useEffect(() => {
    if (notification?.visible) {
      const timer = setTimeout(() => {
        setNotification((prev) => (prev ? { ...prev, visible: false } : null));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  return {
    data,
    setData,
    notification,
    eventMutation,
    isLoading: eventMutation.isPending,
  };
}

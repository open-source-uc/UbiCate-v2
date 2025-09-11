import { useState, useEffect } from "react";

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/ubicateApiClient";
import { PointFeature } from "@/lib/types";

import { NotificationState } from "../components/features/places/forms/notification";

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
  const [notification, setNotification] = useState<NotificationState | null>(null);
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
    onSuccess: () => {
      setNotification({
        type: "success",
        message: method === "POST" ? "Ubicación creada" : "Ubicación actualizada",
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
    placeMutation,
    isLoading: placeMutation.isPending,
  };
}

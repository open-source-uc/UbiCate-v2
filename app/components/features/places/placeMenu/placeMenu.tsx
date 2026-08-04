import { use, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";

import { pinsContext } from "@/app/context/pinsCtx";
import { useSidebar } from "@/app/context/sidebarCtx";
import { apiClient } from "@/lib/api/ubicateApiClient";
import { CATEGORIES, Feature } from "@/lib/types";

import PlaceForm from "../forms/PlaceForm";

import PlaceInformation from "./placeInformation";

export default function PlaceMenu({
  place,
  onCloseMenu,
  onCloseCreate,
  onOpenCreate,
  onOpenEdit,
}: {
  place: Feature;
  onCloseMenu?: () => void;
  onCloseCreate?: () => void;
  onOpenCreate?: () => void;
  onOpenEdit?: () => void;
}) {
  const [mode, setMode] = useState<"information" | "create" | "edit">("information");
  const { clearPins, addPin } = use(pinsContext);
  const { refetchPlaces, setSelectedPlace } = useSidebar();
  const [editPlace, setEditPlace] = useState<Feature | null>(null);

  const approveMutation = useMutation({
    mutationFn: (identifier: string) =>
      apiClient("/api/ubicate", {
        method: "PATCH",
        body: { identifier, action: "approve" },
      }),
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Se aprobó el lugar",
        timer: 2000,
        showConfirmButton: false,
      });
      setSelectedPlace(null);
      onCloseMenu?.();
      refetchPlaces();
    },
    onError: (error: Error) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ identifier, source }: { identifier: string; source: "approved" | "pending" }) =>
      apiClient("/api/ubicate", {
        method: "DELETE",
        body: { identifier, source },
      }),
    onSuccess: (_, variables) => {
      const action = variables.source === "approved" ? "eliminó" : "rechazó";
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: `Se ${action} el lugar`,
        timer: 2000,
        showConfirmButton: false,
      });
      setSelectedPlace(null);
      onCloseMenu?.();
      refetchPlaces();
    },
    onError: (error: Error) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    },
  });

  const handleApprove = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Estás seguro/a de APROBAR el lugar?",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    approveMutation.mutate(place?.properties.identifier);
  };

  const handleDelete = async (source: "approved" | "pending") => {
    const action = source === "approved" ? "eliminar" : "rechazar";
    const result = await Swal.fire({
      icon: "warning",
      title: `¿Estás seguro/a de ${action} el lugar?`,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    deleteMutation.mutate({
      identifier: place?.properties.identifier,
      source,
    });
  };

  return (
    <div className="flex flex-col gap-2 py-2 bg-background text-foreground">
      {mode === "information" && (
        <PlaceInformation
          place={place}
          onClose={() => {
            // La x es la única salida que descarta la geometría marcada en modo edición.
            if (place.properties.categories.includes(CATEGORIES.CUSTOM_MARK)) clearPins();
            onCloseMenu?.();
          }}
          onCreate={() => {
            setMode(() => "create");
            onOpenCreate?.();
          }}
          onEdit={() => {
            clearPins();
            setMode(() => "edit");
            setEditPlace(() => structuredClone(place));
            if (place?.geometry.type === "Point") {
              addPin(place.geometry.coordinates[0], place.geometry.coordinates[1]);
            }
            if (place?.geometry.type === "Polygon") {
              place.geometry.coordinates[0].slice(0, -1).forEach((coord) => {
                addPin(coord[0], coord[1]);
              });
            }
            onOpenEdit?.();
          }}
          onReject={() => handleDelete("pending")}
          onApprove={() => handleApprove()}
          onDelete={() => handleDelete("approved")}
        />
      )}
      {mode === "create" && (
        <PlaceForm
          onClose={() => {
            clearPins();
            setMode(() => "information");
            onCloseCreate?.();
          }}
        />
      )}
      {mode === "edit" && (
        <PlaceForm
          defaultData={{
            name: editPlace?.properties.name ?? "",
            information: editPlace?.properties.information ?? "",
            categories: editPlace?.properties.categories ?? [],
            floors: editPlace?.properties.floors ?? [],
            identifier: editPlace?.properties.identifier,
          }}
          method="PUT"
          submitButtonText="Actualizar"
          title={"Edición: " + editPlace?.properties.name}
          onClose={() => {
            clearPins();
            setMode(() => "information");
            onCloseCreate?.();
          }}
        />
      )}
    </div>
  );
}

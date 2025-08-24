import { use, useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { pinsContext } from "@/app/context/pinsCtx";
import { Feature } from "@/utils/types";
import { apiClient } from "@/utils/ubicateApiClient";

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
  const [editPlace, setEditPlace] = useState<Feature | null>(null);

  const approveMutation = useMutation({
    mutationFn: (identifier: string) =>
      apiClient("/api/ubicate", {
        method: "PATCH",
        body: { identifier },
      }),
    onSuccess: () => {
      alert("Se aprobó el lugar");
      document.location.reload();
    },
    onError: (error: Error) => {
      alert("Hubo un error: " + error.message);
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
      alert(`Se ${action} el lugar`);
      document.location.reload();
    },
    onError: (error: Error) => {
      alert("Hubo un error: " + error.message);
    },
  });

  const handleApprove = () => {
    const confirmacion = confirm("Estas seguro de APROBAR el lugar?") ?? false;
    if (!confirmacion) return;

    approveMutation.mutate(place?.properties.identifier);
  };

  const handleDelete = (source: "approved" | "pending") => {
    const action = source === "approved" ? "eliminar" : "rechazar";
    const confirmacion = confirm(`¿Estás seguro de ${action} el lugar?`) ?? false;
    if (!confirmacion) return;

    deleteMutation.mutate({
      identifier: place?.properties.identifier,
      source,
    });
  };

  return (
    <div className="flex flex-col gap-2 py-2">
      {mode === "information" && (
        <PlaceInformation
          place={place}
          onClose={() => {
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

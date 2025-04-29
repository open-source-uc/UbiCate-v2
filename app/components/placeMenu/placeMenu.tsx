import { Feature } from "@/utils/types";

import PlaceInformation from "./placeInformation";
import { use, useState } from "react";
import { pinsContext } from "@/app/context/pinsCtx";
import PlaceForm from "../forms/PlaceForm";
import { useSidebar } from "@/app/context/sidebarCtx";
import { on } from "events";

export default function placeMenu({
  place,
  onCloseMenu,
  onCloseCreate,
  onOpenCreate,
  onOpenEdit
}: {
  place: Feature;
  onCloseMenu?: () => void;
  onCloseCreate?: () => void;
  onOpenCreate?: () => void;
  onOpenEdit?: () => void;
}) {
  const [mode, setMode] = useState<"information" | "create" | "edit">("information");
  const { clearPins, addPin } = use(pinsContext)
  const { selectedPlace } = useSidebar();
  const [editPlace, setEditPlace] = useState<Feature | null>(null);

  return (
    <div className="flex flex-col gap-2 py-2">
      {mode === "information" && (
        <PlaceInformation
          place={place}
          onClose={onCloseMenu}
          onCreate={() => {
            setMode(() => "create")
            onOpenCreate?.();
          }}
          onEdit={() => {
            clearPins();
            setMode(() => "edit")
            setEditPlace(() => structuredClone(selectedPlace));
            if (selectedPlace?.geometry.type === "Point") {
              addPin(selectedPlace.geometry.coordinates[0], selectedPlace.geometry.coordinates[1])
            }
            if (selectedPlace?.geometry.type === "Polygon") {
              selectedPlace.geometry.coordinates[0].slice(0, -1).forEach((coord) => {
                addPin(coord[0], coord[1]);
              });
            }
            onOpenEdit?.();
          }}
          onReject={() => {
            const confirmacion = confirm("Estas seguro de RECHAZAR el lugar") ?? false;
            if (!confirmacion) return;

            fetch("api/ubicate", {
              method: "PATCH",
              headers: {
                "ubicate-token": sessionStorage.getItem("ubicateToken") ?? "",
              },
              body: JSON.stringify({
                identifier: place.properties.identifier,
                status: "REJECTED",
              }),
            })
          }}
        />
      )}
      {mode === "create" && (
        <PlaceForm onClose={() => {
          setMode(() => "information")
          onCloseCreate?.();
        }}></PlaceForm>
      )}
      {
        mode === "edit" && (
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
              setMode(() => "information")
              onCloseCreate?.();
            }}></PlaceForm>
        )
      }

    </div>
  )
}

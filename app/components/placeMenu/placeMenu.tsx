import { Feature } from "@/utils/types";

import PlaceInformation from "./placeInformation";
import { use, useState } from "react";
import { pinsContext } from "@/app/context/pinsCtx";
import PlaceForm from "../forms/PlaceForm";

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
  const [editPlace, setEditPlace] = useState<Feature | null>(null);

  const approvePlace = () => {
    const confirmacion = confirm("Estas seguro de APROBAR el lugar") ?? false;
    if (!confirmacion) return;

    fetch("api/ubicate", {
      method: "PATCH",
      headers: {
        "ubicate-token": sessionStorage.getItem("ubicateToken") ?? "",
      },
      body: JSON.stringify({
        identifier: place?.properties.identifier,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          res
            .json()
            .then((data) => {
              alert("Hubo un error: " + data.message);
            })
            .catch(() => {
              alert("Hubo un error: " + res.status);
            });
          return;
        }
        alert("Se aprobo");
        document.location.reload();
      })
      .catch(() => {
        alert("Hubo un error");
      });
  };

  const deletePlace = () => {
    const confirmacion =
      confirm("Estas seguro de BORRAR el lugar " + (sessionStorage.getItem("ubicateToken") ?? "")) ?? false;
    if (!confirmacion) return;

    fetch("api/ubicate", {
      method: "DELETE",
      headers: {
        "ubicate-token": sessionStorage.getItem("ubicateToken") ?? "",
      },
      body: JSON.stringify({
        identifier: place?.properties.identifier,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          alert("Hubo un error");
          return;
        }
        alert("Se borro");
        document.location.reload();
      })
      .catch(() => {
        alert("Hubo un error");
      });
  };

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
            setEditPlace(() => structuredClone(place));
            if (place?.geometry.type === "Point") {
              addPin(place.geometry.coordinates[0], place.geometry.coordinates[1])
            }
            if (place?.geometry.type === "Polygon") {
              place.geometry.coordinates[0].slice(0, -1).forEach((coord) => {
                addPin(coord[0], coord[1]);
              });
            }
            onOpenEdit?.();
          }}
          onReject={() => {
            deletePlace()
          }}
          onApprove={() => {
            approvePlace()
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

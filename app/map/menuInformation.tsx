// TypeScript
import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Feature, siglas as MapSiglas, METHOD } from "../../utils/types";
import FormGeo from "../form-geo/form";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger, 
} from "../components/ui/dropdown-menu";

interface MenuProps {
  place: Feature | null;
  onClose: (e: React.MouseEvent) => void;
}

export default function Menu({ place, onClose }: MenuProps) {
  const [edit, setEdit] = useState<boolean>(false);
  const isDebug = useRef<boolean>(sessionStorage.getItem("debugMode") === "true");

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          url: window.location.href,
        });
        console.log("Contenido compartido con éxito");
      } catch (error) {
        console.error("Error al compartir:", error);
      }
    } else {
      console.warn("La API de compartir no está soportada en este navegador.");
    }
  };

  const aprobar = () => {
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
          alert("Hubo un error: " + res.status);
          return;
        }
        alert("Se aprobo");
        document.location.reload();
      })
      .catch(() => {
        alert("Hubo un error");
      });
  };

  const borrar = () => {
    const confirmacion = confirm("Estas seguro de BORRAR el lugar") ?? false;
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
    <>
      {!edit ? (
          <div className="space-y-6">

            <div className="space-y-1">
              <div className="max-w-[300px] h-full flex items-end">
                <h3 className="font-bold text-xl break-words whitespace-normal">
                  {place ? place.properties.name : "Lugar sin nombre"}
                </h3>
              </div>
              {place && place.properties?.categories?.[0] ? (
                <span className="font-light text-sm">
                  {MapSiglas.get(place.properties.categories[0]) || "Lugar sin categoría"}
                </span>
              ) : null}
            </div>

            <section className="flex space-x-2">
              <button 
                onClick={handleShare}
                onKeyDown={(e) => e.key === "Enter" && handleShare}
                aria-label="Comparte esta Ubicación"
                role="navigation"
                tabIndex={0}
                className="p-1 w-full cursor-pointer bg-blue-location hover:bg-brown-light text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2">
                <span style={{ fontSize: "1.6rem" }}  className="material-symbols-outlined">share</span>
                <p className="text-xs font-medium">Compartir</p>
              </button>

              <button 
                onKeyDown={(e) => e.key === "Enter"}
                aria-label="Ingresa a la página web de este lugar"
                role="navigation"
                tabIndex={0}
                className="p-1 w-full cursor-pointer bg-brown-medium hover:bg-brown-light text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2">
                <span style={{ fontSize: "1.6rem" }}  className="material-symbols-outlined">explore</span>
                <p className="text-xs font-medium">Website</p>
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger 
                  onKeyDown={(e) => e.key === "Enter" && handleShare}
                  aria-label="Comparte esta Ubicación"
                  role="navigation"
                  tabIndex={0}
                  className="p-1 w-full cursor-pointer bg-brown-medium hover:bg-brown-light text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2">
                  <span style={{ fontSize: "1.6rem" }}  className="material-symbols-outlined">more_horiz</span>
                  <p className="text-xs font-medium">Más</p>
                </DropdownMenuTrigger>
                  <DropdownMenuContent>

                  {place?.geometry.type !== "Polygon" && (
                    <DropdownMenuItem onClick={() => setEdit(true)}>
                      {place?.properties.identifier === "42-ALL"
                        ? "Agregar ubicación"
                        : "Sugerir Edición"}
                        <span style={{ fontSize: "1.2rem" }}  className="material-symbols-outlined">edit</span>
                    </DropdownMenuItem>
                  )}
                  
                  {place?.geometry.type !== "Polygon" &&
                    place?.properties.identifier !== "42-ALL" &&
                    isDebug.current && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => aprobar()}>
                          Aprobar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => borrar()}>
                          Borrar
                        </DropdownMenuItem>
                      </>
                    )}
                </DropdownMenuContent>
              </DropdownMenu>

            </section>

            <section>
              {place && place.properties?.floors && place.properties.floors.length > 0 ? (
                <div className="flex justify-between">
                  <span className="font-semibold">Piso/s:</span>
                  <span className="flex gap-2">{place.properties.floors.join(", ")}</span>
                </div>
              ) : null}

              {place && place.properties?.categories?.[0] ? (
                <div className="flex justify-between">
                  <span className="font-semibold">Categoría:</span>
                  <span>{MapSiglas.get(place.properties.categories[0]) || "N/A"}</span>
                </div>
              ) : null}

              {place && place.properties?.campus ? (
                <div className="flex justify-between">
                  <span className="font-semibold">Campus:</span>
                  <span>{MapSiglas.get(place.properties.campus) || "N/A"}</span>
                </div>
              ) : null}

              <h3 className="text-xl font-semibold mt-4">Información</h3>
              <div className="mt-2 min-h-16">
                {place ? (
                  place.properties.information === "" ? (
                    "N/A"
                  ) : (
                    <ReactMarkdown className="prose dark:prose-invert">
                      {place.properties.information}
                    </ReactMarkdown>
                  )
                ) : (
                  "N/A"
                )}
              </div>
            </section>
          </div>
      ) : (
        <aside
          className="absolute top-0 left-0 h-full w-full bg-brown-dark text-white-ubi transform transition-transform duration-300 z-60 overflow-y-auto"
        >
          <div className="w-full text-center my-6">
            <h1 className="text-3xl lg:text-6xl text-white select-none">
              {place?.properties.identifier === "42-ALL"
                ? "Nueva ubicación"
                : `Edición de ${place?.properties.name}`}
            </h1>
          </div>
          <FormGeo
            values={{
              placeName: place?.properties.identifier === "42-ALL" ? "" : (place?.properties.name as string),
              information: place?.properties.information as string,
              floor: place?.properties.floors?.[0] ?? 1,
              longitude: place?.geometry.coordinates[0] as number,
              latitude: place?.geometry.coordinates[1] as number,
              categories: place?.properties.categories.at(0) as string,
              identifier: place?.properties.identifier as string,
            }}
            mode={place?.properties.identifier === "42-ALL" ? METHOD.CREATE : METHOD.UPDATE}
            fun={() => setEdit(false)}
          />
        </aside>
      )}
    </>
  );
}
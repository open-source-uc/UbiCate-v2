import React, { useEffect, useRef, useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Feature, siglas as MapSiglas, METHOD } from "../../utils/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import FormGeo from "../form-geo/form";

interface MenuProps {
  place: Feature | null;
  onClose: (e: React.MouseEvent) => void;
  onEdit?: () => void;
  onCloseEdit?: () => void;
}

export default function Menu({ place, onClose, onEdit, onCloseEdit }: MenuProps) {
  const [edit, setEdit] = useState<boolean>(false);
  const isDebug = useRef<boolean>(sessionStorage.getItem("debugMode") === "true");

  useEffect(() => {
    if (edit) {
      onEdit?.();
    }
  }, [edit, onEdit]);

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
      {
        place?.properties.categories.includes("bienvenida_novata") ? (
          <div className="space-y-6 overflow-y-auto">
            <div className="space-y-1 flex flex-col relative bg-brown-dark pt-2 pb-1 top-0 z-10">
              <div className="flex items-center justify-between w-full">
                <div className="max-w-[260px] pr-10">
                  <h3 className="font-bold text-xl break-words whitespace-normal">
                    {place ? place.properties.name : "Lugar sin nombre"}
                  </h3>
                </div>

                <button
                  onClick={(e) => onClose(e)}
                  className="text-white-ubi bg-brown-light flex items-center rounded-full hover:text-brown-light hover:bg-brown-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                  aria-label="Cerrar menú"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {place && place.properties?.categories?.[0] ? (
                <div className="font-light text-sm mt-1">
                  {MapSiglas.get(place.properties.categories[0]) || "Lugar sin categoría"}
                </div>
              ) : null}
            </div>

            <section className="divide-y divide-brown-light/30">
              {place && place.properties?.campus ? (
                <div className="py-4 px-2 transition-colors duration-200 hover:bg-brown-light/5 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-blue-location">
                      <span style={{ fontSize: "1.4rem" }} className="material-symbols-outlined">
                        map
                      </span>
                      <span className="font-medium text-white-ubi">Campus</span>
                    </div>
                    <span className="text-white-ubi font-light">{MapSiglas.get(place.properties.campus) || "N/A"}</span>
                  </div>
                </div>
              ) : null}
            </section>

            {place?.properties.information ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Descripción</h3>
                <div className="bg-brown-medium rounded-md">
                  <ReactMarkdown className="text-white-ubi text-prose p-2 dark:prose-invert">
                    {place.properties.information}
                  </ReactMarkdown>
                </div>
              </div>
            ) : null}
          </div>
        ) :
          !edit ? (
            <div className="space-y-6 overflow-y-auto">
              <div className="space-y-1 flex flex-col relative bg-brown-dark pt-2 pb-1 top-0 z-10">
                <div className="flex items-center justify-between w-full">
                  <div className="max-w-[260px] pr-10">
                    <h3 className="font-bold text-xl break-words whitespace-normal">
                      {place ? place.properties.name : "Lugar sin nombre"}
                    </h3>
                  </div>

                  <button
                    onClick={(e) => onClose(e)}
                    className="text-white-ubi bg-brown-light flex items-center rounded-full hover:text-brown-light hover:bg-brown-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                    aria-label="Cerrar menú"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {place && place.properties?.categories?.[0] ? (
                  <div className="font-light text-sm mt-1">
                    {MapSiglas.get(place.properties.categories[0]) || "Lugar sin categoría"}
                  </div>
                ) : null}
              </div>

              <section className="flex space-x-2 mt-8">
                <button
                  onClick={handleShare}
                  onKeyDown={(e) => e.key === "Enter" && handleShare}
                  aria-label="Comparte esta Ubicación"
                  role="navigation"
                  tabIndex={0}
                  className="p-1 w-full cursor-pointer bg-blue-location hover:bg-brown-light text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                >
                  <span style={{ fontSize: "1.6rem" }} className="material-symbols-outlined">
                    share
                  </span>
                  <p className="text-xs font-medium">Compartir</p>
                </button>

                <button
                  onKeyDown={(e) => e.key === "Enter"}
                  aria-label="Ingresa a la página web de este lugar"
                  role="navigation"
                  tabIndex={0}
                  className="hidden p-1 w-full cursor-pointer bg-brown-medium hover:bg-brown-light text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                >
                  <span style={{ fontSize: "1.6rem" }} className="material-symbols-outlined">
                    explore
                  </span>
                  <p className="text-xs font-medium">Website</p>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    onKeyDown={(e) => e.key === "Enter" && handleShare}
                    aria-label="Comparte esta Ubicación"
                    role="navigation"
                    tabIndex={0}
                    className="p-1 w-full cursor-pointer bg-brown-medium hover:bg-brown-light text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                  >
                    <span style={{ fontSize: "1.6rem" }} className="material-symbols-outlined">
                      more_horiz
                    </span>
                    <p className="text-xs font-medium">Más</p>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {place?.geometry.type !== "Polygon" && (
                      <DropdownMenuItem onClick={() => setEdit(true)}>
                        {place?.properties.identifier === "42-ALL" ? "Agregar ubicación" : "Sugerir Edición"}
                        <span style={{ fontSize: "1.2rem" }} className="material-symbols-outlined">
                          edit
                        </span>
                      </DropdownMenuItem>
                    )}

                    {place?.geometry.type !== "Polygon" && place?.properties.identifier !== "42-ALL" && isDebug.current ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => aprobar()}>Aprobar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => borrar()}>Borrar</DropdownMenuItem>
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </section>

              <section className="divide-y divide-brown-light/30">
                {place && place.properties?.floors && place.properties.floors.length > 0 ? (
                  <div className="py-4 px-2 transition-colors duration-200 hover:bg-brown-light/5 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-blue-location">
                        <span style={{ fontSize: "1.4rem" }} className="material-symbols-outlined">
                          floor
                        </span>
                        <span className="font-medium text-white-ubi">Piso</span>
                      </div>
                      <span className="text-white-ubi font-light">{place.properties.floors.join(", ")}</span>
                    </div>
                  </div>
                ) : null}

                {place && place.properties?.campus ? (
                  <div className="py-4 px-2 transition-colors duration-200 hover:bg-brown-light/5 rounded-b-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-blue-location">
                        <span style={{ fontSize: "1.4rem" }} className="material-symbols-outlined">
                          map
                        </span>
                        <span className="font-medium text-white-ubi">Campus</span>
                      </div>
                      <span className="text-white-ubi font-light">{MapSiglas.get(place.properties.campus) || "N/A"}</span>
                    </div>
                  </div>
                ) : null}
              </section>

              {place?.properties.information ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Descripción</h3>
                  <div className="bg-brown-medium rounded-md">
                    <ReactMarkdown className="text-white-ubi text-prose p-2 dark:prose-invert">
                      {place.properties.information}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-full w-full bg-brown-dark text-white-ubi transform transition-transform duration-300 z-60 overflow-y-auto pb-17">
              <div className="w-full text-center my-6 flex items-center justify-center relative">
                <h1 className="text-2xl text-white-ubi select-none">
                  {place?.properties.identifier === "42-ALL"
                    ? "Nueva ubicación"
                    : `Edición de ${place?.properties.name} (Beta)`}
                </h1>
                <button
                  onClick={(e) => {
                    onCloseEdit?.();
                    setEdit(false);
                  }}
                  className="fixed top-2 right-4 text-white-ubi bg-brown-light flex items-center rounded-full hover:text-brown-light hover:bg-brown-medium pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
                  aria-label="Cerrar menú"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
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
                fun={() => {
                  onCloseEdit?.();
                  setEdit(false);
                }}
              />
            </div>
          )}
    </>
  );
}

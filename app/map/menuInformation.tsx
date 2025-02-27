import React, { useRef, useState } from "react";

import ReactMarkdown from "react-markdown";

import { Feature, siglas as MapSiglas, METHOD } from "../../utils/types";
interface MenuProps {
  place: Feature | null;
  onClose: (e: React.MouseEvent) => void;
}
import FormGeo from "../form-geo/form";

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
        <menu
          className={`absolute | h-1/2 sm:h-full bottom-0 left-0 z-20 sm:w-6/12 md:w-5/12 lg:w-3/12 w-full  sm:mt-0 transition-transform duration-300 ease-in-out  rounded-t-menu sm:rounded-none overflow-y-auto ${place ? "sm:translate-x-0 translate-y-0" : "translate-y-full sm:translate-y-0 sm:-translate-x-full"
            } dark:bg-dark-1 bg-light-1  shadow-lg font-normal text-lg`}
        >
          <div className="p-4 dark:text-white text-gray-700">
            <div className="flex w-full">
              <div className="flex-grow">
                <h2 className="text-2xl font-semibold mb-2">{place ? place.properties.name : "Lugar no disponible"}</h2>
              </div>
              <div>
                <button
                  className="w-6 h-6 flex items-center justify-center dark:text-light-4 border-solid border-2 dark:border-0 border-dark-4 dark:bg-dark-4 bg-slate-200 font-medium 
                  rounded-lg text-lg text-center disabled:opacity-50 disabled:cursor-not-allowed z-30 p-3"
                  onClick={(e) => {
                    onClose(e);
                  }}
                >
                  X
                </button>
              </div>
            </div>
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
                    <ReactMarkdown className="prose dark:prose-invert">{place.properties.information}</ReactMarkdown>
                  )
                ) : (
                  "N/A"
                )}
              </div>
            </section>
            <button
              className="my-2 w-full h-12 flex items-center justify-start dark:text-light-4 dark:bg-dark-3 border-solid border-2 dark:border-0 border-dark-4 dark:enabled:hover:bg-dark-4 enabled:hover:bg-slate-200 font-medium rounded-lg text-lg px-6 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleShare}
              type="button"
            >
              Compartir
            </button>
            {place?.geometry.type === "Polygon" ? null : (
              <button
                className="my-2 w-full h-12 flex items-center justify-start dark:text-light-4 dark:bg-dark-3 border-solid border-2 dark:border-0 border-dark-4 dark:enabled:hover:bg-dark-4 enabled:hover:bg-slate-200 font-medium rounded-lg text-lg px-6 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  setEdit(true);
                }}
                type="button"
              >
                {place?.properties.identifier === "42-ALL" ? "Agregar ubicación" : "Sugerir Edición"}
              </button>
            )}
            {place?.geometry.type === "Polygon" ||
              place?.properties.identifier === "42-ALL" ||
              isDebug.current === false ? null : (
              <div className="flex gap-5">
                <button
                  className="my-2 w-full h-12 flex items-center justify-start dark:text-light-4 dark:bg-dark-3 border-solid border-2 dark:border-0 border-dark-4 dark:enabled:hover:bg-dark-4 enabled:hover:bg-slate-200 font-medium rounded-lg text-lg px-6 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  onClick={() => aprobar()}
                >
                  Aprobar
                </button>
                <button
                  className="my-2 w-full h-12 flex items-center justify-start dark:text-light-4 dark:bg-dark-3 border-solid border-2 dark:border-0 border-dark-4 dark:enabled:hover:bg-dark-4 enabled:hover:bg-slate-200 font-medium rounded-lg text-lg px-6 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  onClick={() => borrar()}
                >
                  Borrar
                </button>
              </div>
            )}
          </div>
        </menu>
      ) : (
        <menu className="absolute bottom-0 left-0 | w-full h-full dark:bg-dark-1 z-20 shadow-lg font-normal text-lg bg-white overflow-y-auto">
          <div className="w-full text-center my-6">
            <h1 className="text-3xl lg:text-6xl text-black dark:text-white select-none">
              {place?.properties.identifier === "42-ALL" ? "Nueva ubicación" : `Edición de ${place?.properties.name}`}
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
          <button
            className="fixed bottom-2 right-2 w-12 h-12 flex items-center justify-center dark:text-light-4 border-solid border-2 dark:border-0 border-dark-4 dark:bg-dark-4 bg-slate-200 font-medium rounded-lg text-lg px-6 text-center disabled:opacity-50 disabled:cursor-not-allowed z-30"
            onClick={(e) => {
              setEdit(false);
            }}
          >
            X
          </button>
        </menu>
      )}
    </>
  );
}

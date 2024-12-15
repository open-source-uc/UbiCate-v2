import React, { useState } from "react";

import { Feature, siglas as MapSiglas, METHOD } from "../../utils/types";
interface MenuProps {
  place: Feature | null;
}
import FormGeo from "../form-geo/form";

export default function Menu({ place }: MenuProps) {
  const [edit, setEdit] = useState<boolean>(false);

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

  return (
    <>
      {!edit ? (
        <menu
          className={`absolute | h-1/2 sm:h-full bottom-0 left-0 z-20 sm:w-6/12 md:w-5/12 lg:w-3/12 w-full  sm:mt-0 transition-transform duration-300 ease-in-out  rounded-t-menu sm:rounded-none overflow-y-auto ${place ? "sm:translate-x-0 translate-y-0" : "translate-y-full sm:translate-y-0 sm:-translate-x-full"
            } dark:bg-dark-1 bg-light-1  shadow-lg font-normal text-lg`}
        >
          <div className="p-4 dark:text-white text-gray-700">
            <h2 className="text-2xl font-semibold mb-2">{place ? place.properties.name : "Lugar no disponible"}</h2>
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
              <p className="mt-2 min-h-16">
                {place ? (place.properties.information == "" ? "N/A" : place.properties.information) : "N/A"}
              </p>
            </section>
            <button
              className="my-2 w-full h-12 flex items-center justify-start dark:text-light-4 dark:bg-dark-3 border-solid border-2 dark:border-0 border-dark-4 dark:enabled:hover:bg-dark-4 enabled:hover:bg-slate-200 font-medium rounded-lg text-lg px-6 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleShare}
              type="button"
            >
              Compartir
            </button>
            <button
              className="my-2 w-full h-12 flex items-center justify-start dark:text-light-4 dark:bg-dark-3 border-solid border-2 dark:border-0 border-dark-4 dark:enabled:hover:bg-dark-4 enabled:hover:bg-slate-200 font-medium rounded-lg text-lg px-6 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                setEdit(true);
              }}
              type="button"
            >
              {place?.properties.identifier === "42-ALL" ? "Agregar ubicación" : "Sugerir Edición"}
            </button>
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
              floor: place?.properties.floors[0] as number,
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

"use client";

import { useEffect, useState, useCallback, Suspense } from "react";

import { Formik, Field, Form, ErrorMessage, useFormikContext } from "formik";

import getGeolocation from "@/utils/getGeolocation";
import { campusBounds } from "@/utils/getParamCampusBounds";

import PlacesJSON from "../../data/places.json";

import MapComponent from "./map";

interface newPlace {
  longitude: number | null;
  latitude: number | null;
  placeName: string;
  information: string;
  floor: number;
}

interface errors {
  longitude?: number | string | null;
  latitude?: number | string | null;
  placeName?: string;
  information?: string;
  floor?: string;
}
interface Feature {
  type: "Feature";
  properties: {
    identifier: string;
    name: string;
    information: string;
    categories: string;
    campus: string;
    faculties: string;
    floor: number;
    category: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

const nameToSigla = new Map<string, string>([
  ["SanJoaquin", "SJ"],
  ["LoContador", "LC"],
  ["Villarrica", "VR"],
  ["CasaCentral", "CC"],
  ["Oriente", "OR"],
]);

const initialValues = { placeName: "", information: "", floor: 1, latitude: null, longitude: null };

export default function FormComponent() {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [longitude, setLongitude] = useState<number>(-70.6109);
  const [latitude, setLatitude] = useState<number>(-33.4983);
  const [campus, setCampus] = useState<string>("");

  const dragLocUpdate = useCallback((event: any) => {
    setLongitude(event.lngLat.lng);
    setLatitude(event.lngLat.lat);
  }, []);

  const validate = (newPlace: Omit<newPlace, "longitude" | "latitude">) => {
    const errors: errors = {};

    var campus: string | null = null;

    for (const [boundaryCampus, boundary] of Object.entries(campusBounds)) {
      if (
        longitude >= boundary.longitudeRange[0] &&
        longitude <= boundary.longitudeRange[1] &&
        latitude >= boundary.latitudeRange[0] &&
        latitude <= boundary.latitudeRange[1]
      ) {
        campus = nameToSigla.get(boundaryCampus) || null;
        break;
      }
    }
    if (!campus) {
      errors.latitude = "Ubicación fuera de algún campus";
    } else {
      setCampus(campus);
    }

    if (!newPlace.placeName) {
      errors.placeName = "Requerido";
    } else if (newPlace.placeName.length > 50) {
      errors.placeName = "Nombre demasiado largo";
    }

    if (newPlace.information && newPlace.information.length > 200) {
      errors.information = "Informacion demasiado larga";
    }

    if (Math.abs(newPlace.floor) > 20) {
      errors.floor = "Piso inválido";
    }

    return errors;
  };

  async function handleSubmit(values: any) {
    setSubmitting(true);

    const transformedValues = {
      ...values,
      longitude,
      latitude,
      campus,
      name: values.placeName.trim(),
    };
    delete transformedValues.placeName;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transformedValues),
    };

    fetch("/api/data", requestOptions)
      .then((res) => {
        return Promise.all([res.json(), res]);
      })
      .then(([data, res]) => {
        if (!res.ok) {
          return Promise.reject(data.message || "Error: " + res.statusText);
        }
        alert("Tu sala ha sido registrada.");
        setSubmitting(false);
      })
      .catch((error) => {
        alert(`Error al registrar la sala: ${error}`);
        console.error("Error al registrar la sala:", error);
        setSubmitting(false);
      });
  }

  interface FormObserverProps {
    setLatitude: (lat: number) => void;
    setLongitude: (lon: number) => void;
  }
  function FormObserver({ setLatitude, setLongitude }: FormObserverProps) {
    const { values, setFieldValue } = useFormikContext();

    const [suggestions, setSuggestions] = useState<any[]>([]);
    useEffect(() => {
      const placeValues = values as newPlace;

      if (placeValues.placeName.length < 3) return;

      const filtered = PlacesJSON.features
        .filter(
          (suggestion) =>
            suggestion.properties.name.toLowerCase().includes(placeValues.placeName.toLowerCase()) &&
            placeValues.placeName.toLowerCase() !== suggestion.properties.name.toLowerCase(),
        )
        .slice(0, 3);

      setSuggestions(filtered);
    }, [values]);

    return (
      <>
        {suggestions.length > 0 && (
          <ul className="flex flex-col justify-start w-full">
            {suggestions.map((suggestion: Feature, index) => (
              <li
                key={index}
                className="underline dark:bg-dark-3 cursor-pointer w-full text-left"
                onClick={() => {
                  setFieldValue("longitude", suggestion.geometry.coordinates[1] || null);
                  setLongitude(suggestion.geometry.coordinates[0]);

                  setFieldValue("latitude", suggestion.geometry.coordinates[0] || null);
                  setLatitude(suggestion.geometry.coordinates[1]);

                  setFieldValue("placeName", suggestion.properties.name || "");
                  setFieldValue("floor", suggestion.properties.floor || 1);
                  setFieldValue("information", suggestion.properties.information || "");
                }}
              >
                {index + 1}. {suggestion.properties.name}
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  useEffect(() => {
    getGeolocation(setLatitude, setLongitude);
  }, []);

  return (
    <main className="flex min-h-full w-full items-center justify-center dark:bg-dark-1">
      <div className="flex flex-col px-4 w-5/6 h-5/6 my-2 py-1 items-center justify-center rounded dark:bg-dark-1 space-y-6">
        <Formik initialValues={initialValues} onSubmit={handleSubmit} validate={validate}>
          {({ isSubmitting = submitting }) => (
            <Form className="flex flex-col justify-center items-center w-full space-y-4 max-w-screen-lg text-xl">
              <h1 className="text-3xl lg:text-6xl text-black dark:text-white select-none">Nueva ubicación</h1>
              <h2 className="mb-16 pb-16 text-base lg:text-lg text-black dark:text-light-4 select-none text-center">
                Ayúdanos registrando una nueva sala, oficina u cualquier otro espacio que consideres pertinente.
              </h2>

              <label
                className="my-2 flex items-center justify-center text-black dark:text-light-4 lg:text-2xl"
                htmlFor="placeName"
              >
                Nombre (Ej: Departamento de Asistencia Económica, K203, ... )
              </label>
              <Field
                className="block p-3 w-full text-lg rounded-lg border dark:bg-dark-3 border-dark-4 dark:text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="placeName"
                id="placeName"
                type="text"
              />
              <FormObserver setLatitude={setLatitude} setLongitude={setLongitude} />

              <ErrorMessage
                className="text-error font-bold text-sm w-full text-left"
                name="placeName"
                component="div"
              />
              <label
                className="my-2 flex items-center justify-center dark:text-light-4 lg:text-2xl"
                htmlFor="placeName"
              >
                Piso
              </label>
              <Field
                className="block p-3 w-full text-lg rounded-lg border dark:bg-dark-3 border-dark-4 dark:text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="floor"
                id="floor"
                type="number"
              />
              <ErrorMessage className="text-error font-bold text-sm w-full text-left" name="floor" component="div" />
              <label
                className="my-2 flex items-center justify-center dark:text-light-4 lg:text-2xl"
                htmlFor="placeName"
              >
                Información (opcional)
              </label>
              <Field
                className="block p-3 w-full text-lg lg:text-xl rounded-lg border dark:bg-dark-3 border-dark-4 dark:text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="information"
                id="information"
                type="text"
              />

              <label
                className="my-2 flex items-center justify-center dark:text-light-4 lg:text-2xl"
                htmlFor="placeName"
              >
                Ubicación
              </label>
              <div className="flex p-3 w-full h-96 text-lg lg:text-xl rounded-lg border dark:bg-dark-3 border-dark-4 dark:text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Suspense>
                  <MapComponent
                    markerPosition={{
                      longitude: longitude,
                      latitude: latitude,
                    }}
                    onMarkerMove={dragLocUpdate}
                  />
                </Suspense>
              </div>
              <ErrorMessage
                className="text-error font-bold text-sm w-full text-center"
                name="longitude"
                component="div"
              />
              <ErrorMessage className="text-error font-bold text-sm w-full text-left" name="latitude" component="div" />
              <button
                className="my-2 w-48 h-12 flex items-center justify-center dark:text-light-4 dark:bg-dark-3 border-solid border-2 dark:border-0 border-dark-4 dark:enabled:hover:bg-dark-4 enabled:hover:bg-slate-200 font-medium rounded-lg text-lg px-6 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                Enviar
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}

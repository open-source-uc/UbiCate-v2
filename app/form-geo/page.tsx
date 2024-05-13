"use client";

import { useSearchParams } from "next/navigation";

import { useEffect, useState, useCallback } from "react";

import { Formik, Field, Form, ErrorMessage } from "formik";

import getGeolocation from "@/utils/getGeolocation";
import { campusBounds, getParamCampusBounds } from "@/utils/getParamCampusBounds";

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

const initialValues = { placeName: "", information: "", floor: 1, latitude: null };

export default function Page() {
  const searchParams = useSearchParams();
  const campusMapBounds = getParamCampusBounds(searchParams.get("campus"));

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [longitude, setLongitude] = useState<number>(-70.6109);
  const [latitude, setLatitude] = useState<number>(-33.4983);

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
        campus = boundaryCampus;
        break;
      }
    }
    if (!campus) errors.latitude = "Ubicación fuera de algún campus";

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
      name: values.placeName,
    };
    delete transformedValues.placeName;

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transformedValues),
    };

    fetch("https://ubicate-uc.fly.dev/api/collections/coordinates/records", requestOptions)
      .then((data) => {
        setSubmitting(false);
        alert("Tu sala ha sido registrada.");
      })
      .catch((error) => {
        setSubmitting(false);
        console.error("Error al registrar la sala:", error);
      });
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
                Sala
              </label>
              <Field
                className="block p-3 w-full text-lg rounded-lg border dark:bg-dark-3 border-dark-4 dark:text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="placeName"
                id="placeName"
                type="text"
              />
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
                Arrastra el marcador a la ubicación deseada
              </label>
              <div className="flex p-3 w-full h-96 text-lg lg:text-xl rounded-lg border dark:bg-dark-3 border-dark-4 dark:text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <MapComponent
                  markerPosition={{
                    longitude: longitude,
                    latitude: latitude,
                  }}
                  mapBounds={campusMapBounds}
                  onMarkerMove={dragLocUpdate}
                />
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

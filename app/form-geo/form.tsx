"use client";

import { useEffect, useState, useCallback, Suspense } from "react";

import { Formik, Field, Form, ErrorMessage } from "formik";

import getGeolocation from "@/utils/getGeolocation";
import { campusBounds } from "@/utils/getParamCampusBounds";

import { siglas as MapSiglas } from "../../utils/types";

import MapComponent from "./map";

interface newPlace {
  longitude: number | null;
  latitude: number | null;
  placeName: string;
  information: string;
  floor: number;
  categories: string;
}

interface errors {
  longitude?: number | string | null;
  latitude?: number | string | null;
  placeName?: string;
  information?: string;
  floor?: string;
  categories?: string;
}

interface InitialValues {
  placeName: string;
  information: string;
  floor: number;
  latitude: number | null;
  longitude: number | null;
  categories: string;
}

const defaultValues: InitialValues = {
  placeName: "",
  information: "",
  floor: 1,
  latitude: null,
  longitude: null,
  categories: "",
};

export default function FormComponent({ values }: { values: InitialValues | null }) {
  const initialValues = values || defaultValues;

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
        campus = MapSiglas.get(boundaryCampus) || null;
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
    } else if (newPlace.placeName.length > 60) {
      errors.placeName = "Nombre demasiado largo";
    }
    if (newPlace.categories == "") {
      errors.categories = "Debe seleccionar una categoria.";
    }

    if (newPlace.information && newPlace.information.length > 200) {
      errors.information = "Informacion demasiado larga";
    }

    if (Math.abs(newPlace.floor) > 20) {
      errors.floor = "Piso inválido";
    }

    return errors;
  };

  async function handleSubmit(values: any, { resetForm }: any) {
    setSubmitting(true);

    const transformedValues = {
      ...values,
      longitude,
      latitude,
      campus,
      identifier: "",
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
        alert(data.message);
        resetForm();
        setSubmitting(false);
      })
      .catch((error) => {
        alert(`Error al registrar la sala: ${error}`);
        console.error("Error al registrar la sala:", error);
        setSubmitting(false);
      });
  }

  useEffect(() => {
    if (initialValues.longitude && initialValues.latitude) {
      setLatitude(initialValues.latitude);
      setLongitude(initialValues.longitude);
    } else {
      getGeolocation(setLatitude, setLongitude);
    }
  }, []);

  return (
    <section className="flex w-full items-center justify-center dark:bg-dark-1">
      <div className="flex flex-col px-4 w-5/6 max-w-md h-5/6 my-2 py-1 items-center justify-center rounded dark:bg-dark-1 space-y-6">
        <Formik initialValues={initialValues} onSubmit={handleSubmit} validate={validate}>
          {({ isSubmitting = submitting }) => (
            <Form className="flex flex-col justify-center items-center w-full space-y-4 max-w-screen-lg text-xl">
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

              <ErrorMessage
                className="text-error font-bold text-sm w-full text-left"
                name="placeName"
                component="div"
              />
              <label
                className="my-2 flex items-center justify-center dark:text-light-4 lg:text-2xl"
                htmlFor="categories"
              >
                Categoria
              </label>
              <Field
                name="categories"
                as="select"
                className="block p-3 w-full text-lg rounded-lg border dark:bg-dark-3 border-dark-4 dark:text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar</option>
                <option value="classroom">Sala</option>
                <option value="bath">Baño</option>
                <option value="food_lunch">Comida</option>
                <option value="studyroom">Sala de estudio</option>
                <option value="trash">Basurero</option>
                <option value="photocopy">Fotocopias</option>
                <option value="park_bicycle">Bicicletero</option>
                <option value="financial">Banco / Cajero automático</option>
                <option value="laboratory">Laboratorio</option>
                <option value="water">Punto de agua</option>
                <option value="other">Otro</option>
              </Field>
              <ErrorMessage
                className="text-error font-bold text-sm w-full text-left"
                name="categories"
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
    </section>
  );
}

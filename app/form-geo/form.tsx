"use client";

import { useEffect, useState, useCallback, Suspense } from "react";

import { Formik, Field, Form, ErrorMessage } from "formik";

import { campusBounds } from "@/utils/getCampusBounds";
import getGeolocation from "@/utils/getGeolocation";

import { siglas as MapSiglas, METHOD } from "../../utils/types";

import MapComponent from "./map";

interface errors {
  longitude?: number | string | null;
  latitude?: number | string | null;
  placeName?: string;
  information?: string;
  floor?: string;
  categories?: string;
}

interface newPlace {
  longitude: number | null;
  latitude: number | null;
  placeName: string;
  information: string;
  floor: number;
  categories: string;
  identifier: string | null;
}

const defaultValues: newPlace = {
  placeName: "",
  information: "",
  floor: 1,
  latitude: null,
  longitude: null,
  categories: "",
  identifier: null,
};

export default function FormComponent({
  values,
  mode,
  fun,
}: {
  values: newPlace | null;
  mode: METHOD;
  fun: (() => void) | null;
}) {
  const initialValues = values || defaultValues;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [longitude, setLongitude] = useState<number | undefined | null>(values?.longitude);
  const [latitude, setLatitude] = useState<number | undefined | null>(values?.latitude);
  const [campus, setCampus] = useState<string>("");

  const dragLocUpdate = useCallback((event: any) => {
    setLongitude(event.lngLat.lng);
    setLatitude(event.lngLat.lat);
  }, []);

  const validate = (newPlace: Omit<newPlace, "longitude" | "latitude" | "identifier">) => {
    const errors: errors = {};

    var campus: string | null = null;

    if (!longitude || !latitude) {
      errors.latitude = "Ubicación fuera de algún campus";
      return;
    }

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
      errors.placeName = "El nombre es demasiado largo";
    }
    if (newPlace.categories == "") {
      errors.categories = "Debes seleccionar una categoría";
    }

    if (newPlace.information && newPlace.information.length > 200) {
      errors.information = "La descripción es demasiado larga";
    }

    if (newPlace.floor > 20) {
      errors.floor = "Piso inválido";
    }
    if (newPlace.floor < -10) {
      errors.floor = "Piso inválido";
    }

    if (Math.abs(newPlace.floor) == 0) {
      errors.floor = "Piso 0 es inválido";
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
      identifier: initialValues.identifier,
      name: values.placeName.trim(),
    };
    delete transformedValues.placeName;
    const requestOptions = {
      method: METHOD.CREATE == mode ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transformedValues),
    };

    fetch("/api/ubicate", requestOptions)
      .then((res) => {
        return Promise.all([res.json(), res]);
      })
      .then(([data, res]) => {
        if (!res.ok) {
          return Promise.reject(data.message || "Error: " + res.statusText);
        }
        alert(data.message);
        resetForm();
        if (fun != null) {
          fun();
        }
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
  }, [initialValues]);

  return (
    <section className="flex w-full items-center justify-center py-4">
      <div className="flex flex-col w-5/6 max-w-md items-center justify-center">
        <Formik initialValues={initialValues} onSubmit={handleSubmit} validate={validate}>
          {({ isSubmitting = submitting, setFieldValue, values }) => (
            <Form className="space-y-12 text-md">
              <div className="space-y-4">
                <label
                  className="flex items-center justify-center text-md font-medium text-white-ubi"
                  htmlFor="placeName"
                >
                  Nombre de la Ubicación
                </label>
                <p className="text-xs text-white-ubi italic text-center">
                  Ejemplo: &quot;Sala de Estudio&quot;, &quot;Fork&quot;, &quot;Departamento de Ciencia de la
                  Computación&quot;
                </p>
                <Field
                  className="block p-3 w-full text-sm rounded-lg border border-brown-light dark:text-light-4 focus:ring-blue-location focus:outline-hidden focus:ring-2"
                  name="placeName"
                  id="placeName"
                  type="text"
                />
                <ErrorMessage
                  className="text-blue-location font-bold text-sm w-full text-left"
                  name="placeName"
                  component="div"
                />
              </div>

              <div className="space-y-4">
                <label
                  className="flex items-center justify-center text-md font-medium text-white-ubi"
                  htmlFor="categories"
                >
                  Categoría de la Ubicación
                </label>
                <p className="text-xs text-white-ubi text-center italic">
                  Selecciona la categoría que consideres que más corresponda
                </p>
                <Field
                  id="categories"
                  name="categories"
                  as="select"
                  className="block p-4 w-full text-sm rounded-lg border border-brown-light focus:outline-hidden focus:ring-2 focus:ring-blue-location bg-brown-dark"
                >
                  <option value="">Seleccionar</option>
                  <option value="classroom">Sala</option>
                  <option value="bath">Baño</option>
                  <option value="food_lunch">Comida</option>
                  <option value="studyroom">Sala de estudio</option>
                  <option value="trash">Reciclaje</option>
                  <option value="park_bicycle">Bicicletero</option>
                  <option value="financial">Banco / Cajero automático</option>
                  <option value="laboratory">Laboratorio</option>
                  <option value="water">Punto de agua</option>
                  <option value="auditorium">Auditorio</option>
                  <option value="sports_place">Deporte</option>
                  <option value="computers">Sala de computadores</option>
                  <option value="photocopy">Fotocopias / Impresoras</option>
                  <option value="shop">Tienda</option>
                  <option value="other">Otro</option>
                </Field>
                <ErrorMessage
                  name="categories"
                  component="div"
                  className="text-blue-location font-semibold text-sm w-full text-left"
                />
              </div>

              {/* Continue applying the same style onwards */}

              <div className="space-y-4">
                <label className="flex items-center justify-center text-md font-medium text-white-ubi" htmlFor="floor">
                  Piso
                </label>
                <p className="text-xs text-white-ubi text-center italic">
                  Si corresponde, selecciona el piso en el que se encuentra la ubicación. En caso que no aplique,
                  selecciona 1
                </p>
                <div className="flex items-center gap-2 w-full">
                  <Field
                    className="block p-3 w-full text-sm rounded-lg border border-brown-light focus:ring-blue-location focus:outline-hidden focus:ring-2"
                    name="floor"
                    id="floor"
                    type="number"
                  />
                  <button
                    type="button"
                    className="w-12 h-12 bg-transparent border border-brown-light text-white-ubi rounded-full focus:ring-blue-location focus:outline-hidden focus:ring-2 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center"
                    onClick={() => setFieldValue("floor", Math.max(values.floor - 1, -Infinity))}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    className="w-12 h-12 bg-transparent border border-brown-light text-white-ubi rounded-full focus:ring-blue-location focus:outline-hidden focus:ring-2 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center"
                    onClick={() => setFieldValue("floor", Math.min(values.floor + 1, Infinity))}
                  >
                    +
                  </button>
                </div>
                <ErrorMessage
                  className="text-blue-location font-bold text-sm w-full text-left"
                  name="floor"
                  component="div"
                />
              </div>

              <div className="space-y-4">
                <label
                  className="flex items-center justify-center text-md font-medium text-white-ubi"
                  htmlFor="information"
                >
                  Descripción (Opcional)
                </label>
                <p className="text-xs text-white-ubi text-center italic">
                  ¡Cuéntanos más sobre esta ubicación!
                  <br />- Soporta markdown -
                </p>
                <Field
                  className="block p-3 w-full h-36 text-sm rounded-lg border border-brown-light dark:text-light-4 focus:ring-blue-location focus:outline-hidden focus:ring-2"
                  name="information"
                  id="information"
                  as="textarea"
                />
              </div>

              <div className="space-y-4">
                <label
                  className="flex items-center justify-center text-md font-medium text-white-ubi"
                  htmlFor="location"
                >
                  Ubicación
                </label>
                <div className="flex p-3 w-full h-96 rounded-lg border border-brown-light focus:ring-blue-location focus:outline-hidden focus:ring-2">
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
                  className="text-blue-location font-bold text-sm w-full text-center"
                  name="longitude"
                  component="div"
                />
                <ErrorMessage
                  className="text-blue-location font-bold text-sm w-full text-left"
                  name="latitude"
                  component="div"
                />
              </div>

              <button
                className="w-full p-3 text-white-ubi bg-transparent border border-brown-light rounded-lg hover:bg-brown-light/10 focus:ring-blue-location focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

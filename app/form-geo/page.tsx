"use client";

import { useEffect, useState, useCallback } from "react";

import { Formik, Field, Form, ErrorMessage } from "formik";

import getGeolocation from "@/utils/getGeolocation";

import FormMap from "./FormMap";

interface newPlace {
  longitude: number | null;
  latitude: number | null;
  placeName: string;
  information: string;
  author: string;
}

interface errors {
  longitude?: number | string | null;
  latitude?: number | string | null;
  placeName?: string;
  information?: string;
  author?: string;
}

export default function Page() {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);

  const dragLocUpdate = useCallback((event: any) => {
    setLongitude(event.lngLat.lng);
    setLatitude(event.lngLat.lat);
  }, []);

  const validate = (newPlace: newPlace) => {
    const campusBoundaries = [
      { campus: "San Joaquin", longitudeRange: [-70.6171, -70.6043], latitudeRange: [-33.5021, -33.4952] },
      { campus: "Lo Contador", longitudeRange: [-70.6198, -70.6154], latitudeRange: [-33.4207, -33.4178] },
      { campus: "Villarrica", longitudeRange: [-72.2264, -72.2244], latitudeRange: [-39.2787, -39.2771] },
      { campus: "Casa Central", longitudeRange: [-70.6481, -70.6471], latitudeRange: [-33.4428, -33.4418] },
      { campus: "Oriente", longitudeRange: [-70.597, -70.5902], latitudeRange: [-33.4477, -33.4435] },
    ];

    const errors: errors = {};

    if (!newPlace.longitude) {
      errors.longitude = "Longitud Requerida";
    } else if (!newPlace.latitude) {
      errors.latitude = "Latitud Requerida";
    } else {
      var campus: string | null = null;

      for (const boundary of campusBoundaries) {
        if (
          newPlace.longitude >= boundary.longitudeRange[0] &&
          newPlace.longitude <= boundary.longitudeRange[1] &&
          newPlace.latitude >= boundary.latitudeRange[0] &&
          newPlace.latitude <= boundary.latitudeRange[1]
        ) {
          campus = boundary.campus;
          break;
        }
      }

      if (!campus) errors.latitude = "Estas fuera de algún campus";
    }

    if (!newPlace.placeName) {
      errors.placeName = "Requerido";
    } else if (newPlace.placeName.length > 20) {
      errors.placeName = "Nombre demasiado largo";
    }

    if (newPlace.information && newPlace.information.length > 200) {
      errors.information = "Informacion demasiado larga";
    }

    if (newPlace.author.length > 20) {
      errors.author = "Nombre del autor demasiado largo";
    }

    return errors;
  };

  async function handleSubmit(values: any) {
    setSubmitting(true);

    const transformedValues = {
      ...values,
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
    <div className="flex h-full w-full items-center justify-center bg-dark-1">
      <div className="flex flex-col px-4 w-5/6 h-5/6 items-center justify-center rounded bg-dark-2 space-y-6">
        <Formik
          initialValues={{ longitude: longitude, latitude: latitude, placeName: "", information: "", author: "" }}
          onSubmit={handleSubmit}
          validate={validate}
          enableReinitialize={true}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col justify-center items-center w-full space-y-4 max-w-screen-lg text-xl">
              <h1 className="text-3xl lg:text-6xl text-light-2">Nueva localización</h1>
              <h2 className="mb-16 pb-16 text-base lg:text-lg text-light-4 text-center">
                Ayúdanos registrando una nueva sala, oficina u cualquier otro espacio que consideres pertinente.
              </h2>
              <ErrorMessage className="text-error text-sm w-full text-center" name="longitude" component="div" />
              <ErrorMessage className="text-error text-sm w-full text-center" name="latitude" component="div" />
              <label className="my-2 flex items-center justify-center text-light-4 lg:text-2xl" htmlFor="placeName">
                Sala
              </label>
              <Field
                className="block p-3 w-full text-lg rounded-lg border bg-dark-3 border-dark-4 text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="placeName"
                id="placeName"
                type="text"
              />
              <ErrorMessage className="text-error text-sm w-full text-left" name="placeName" component="div" />
              <label className="my-2 flex items-center justify-center text-light-4 lg:text-2xl" htmlFor="placeName">
                Autor (opcional)
              </label>
              <Field
                className="block p-3 w-full text-lg rounded-lg border bg-dark-3 border-dark-4 text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="author"
                id="author"
                type="text"
              />
              <ErrorMessage className="text-error text-sm w-full text-left" name="author" component="div" />
              <label className="my-2 flex items-center justify-center text-light-4 lg:text-2xl" htmlFor="placeName">
                Información (opcional)
              </label>
              <Field
                className="block p-3 w-full text-lg lg:text-xl rounded-lg border bg-dark-3 border-dark-4 text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="information"
                id="information"
                type="text"
              />

              <label className="my-2 flex items-center justify-center text-light-4 lg:text-2xl" htmlFor="placeName">
                Selecciona tu ubicación en el mapa
              </label>
              <div className="flex p-3 w-full h-96 text-lg lg:text-xl rounded-lg border bg-dark-3 border-dark-4 text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <FormMap
                  initialViewState={{ longitude: -70.6109, latitude: -33.4983, zoom: 15 }}
                  onDrag={dragLocUpdate}
                />
              </div>

              <button
                className="my-2 w-48 h-12 flex items-center justify-center text-light-4 bg-dark-3 enabled:hover:bg-dark-4 font-medium rounded-lg text-lg px-6 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                Submit
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { Formik, Field, Form, ErrorMessage } from "formik";

import getGeolocation from "@/utils/getGeolocation";

interface newPlace {
  longitude: number;
  latitude: number;
  placeName: string;
  information: string;
}

interface errors {
  longitude?: string;
  latitude?: string;
  placeName?: string;
  information?: string;
}

export default function Page() {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);

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
    } else if (newPlace.placeName.length > 40) {
      errors.placeName = "Nombre demasiado largo";
    }

    if (newPlace.information && newPlace.information.length > 200) {
      errors.information = "Informacion demasiado larga";
    }

    return errors;
  };

  async function handleSubmit(values: any) {
    setSubmitting(true);
    setTimeout(() => {
      alert(JSON.stringify(values, null, 2));
      setSubmitting(false);
    }, 1000);
  }

  useEffect(() => {
    getGeolocation(setLatitude, setLongitude);
  }, []);
  return (
    <div className="flex h-full w-full items-center justify-center bg-dark-1">
      <div className="flex flex-col w-5/6 h-5/6 items-center justify-center rounded bg-dark-2 p-4 space-y-6">
        <Formik
          initialValues={{ longitude: longitude, latitude: latitude, placeName: "", information: "" }}
          onSubmit={handleSubmit}
          validate={validate}
          enableReinitialize={true}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col justify-center items-center w-full max-w-lg space-y-4">
              <h1 className="text-2xl mb-2 text-light-4">Nueva Sala</h1>
              <ErrorMessage className="text-error text-sm w-full text-center" name="longitude" component="div" />
              <ErrorMessage className="text-error text-sm w-full text-center" name="latitude" component="div" />

              <label className="my-2 flex items-center justify-center text-light-4" htmlFor="placeName">
                Sala
              </label>
              <Field
                className="block p-3 w-full max-w-lg text-lg rounded-lg border bg-dark-3 border-dark-4 text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="placeName"
                id="placeName"
                type="text"
              />
              <ErrorMessage className="text-error text-sm w-full text-left" name="placeName" component="div" />

              <label className="my-2 flex items-center justify-center text-light-4" htmlFor="information">
                Información (opcional)
              </label>
              <Field
                className="block p-3 w-full max-w-lg text-lg rounded-lg border bg-dark-3 border-dark-4 text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="information"
                id="information"
                type="text"
                component="textarea"
              />
              <ErrorMessage className="text-error text-sm w-full text-left" name="information" component="div" />

              <button
                className="my-2 text-light-4 bg-dark-3 enabled:hover:bg-dark-4 font-medium rounded-lg text-lg w-full sm:w-auto px-6 py-3 text-center disabled:opacity-50 disabled:cursor-not-allowed"
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

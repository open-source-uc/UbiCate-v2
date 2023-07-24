"use client";

import { useEffect, useState } from "react";

import { Formik, Field, Form, ErrorMessage } from "formik";

import NumberInputDisabled from "./NumberInputDisabled";

interface newPlace {
  longitude: number;
  latitude: number;
  placeName: string;
}

export default function Page() {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [longitude, setLongitude] = useState<number>((-70.6171 + -70.6043) / 2);
  const [latitude, setLatitude] = useState<number>((-33.5021 + -33.4952) / 2);

  const validate = (newPlace: newPlace) => {
    console.log(newPlace, newPlace.longitude, !newPlace.longitude);

    const boundaries = [
      { campus: "San Joaquin", longitudeRange: [-70.6171, -70.6043], latitudeRange: [-33.5021, -33.4952] },
      { campus: "Lo Contador", longitudeRange: [-70.6198, -70.6154], latitudeRange: [-33.4207, -33.4178] },
      { campus: "Villarrica", longitudeRange: [-72.2264, -72.2244], latitudeRange: [-39.2787, -39.2771] },
      { campus: "Casa Central", longitudeRange: [-70.6481, -70.6471], latitudeRange: [-33.4428, -33.4418] },
      { campus: "Oriente", longitudeRange: [-70.597, -70.5902], latitudeRange: [-33.4477, -33.4435] },
    ];

    const errors = {};

    if (newPlace.longitude === null) {
      errors.longitude = "Required";
    } else if (newPlace.latitude === null) {
      errors.latitude = "Required";
    } else {
      var campus: string = null;

      for (const boundary of boundaries) {
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

      if (!campus) errors.longitude = "No campus found for the given coordinates";
    }

    if (!newPlace.placeName) {
      errors.placeName = "Required";
    } else if (newPlace.placeName.length > 40) {
      errors.placeName = "Must be 15 characters or less";
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
    // timeout
    const timeout = setTimeout(() => {
      setLatitude(1);
      setLongitude(1);
      console.log("timeout");
    }, 2000);
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col w-1/2 h-2/3 bg-green-300 items-center justify-center rounded">
        <Formik
          initialValues={{ longitude: longitude, latitude: latitude, placeName: "" }}
          onSubmit={handleSubmit}
          validate={validate}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col justify-center items-center">
              <div className="flex flex-row w-full">
                <Field
                  id="longitude"
                  name="longitude"
                  label="Longitud"
                  component={NumberInputDisabled}
                />
                <Field id="latitude" name="latitude" label="Latitud" value={13} component={NumberInputDisabled} type='number' />
              </div>

              <ErrorMessage name="longitude" />
              <ErrorMessage name="latitude" />

              <label className="my-2 flex items-center justify-center" htmlFor="placeName">
                Nombre del lugar a agregar
              </label>
              <Field className="my-2 w-1/2" name="placeName" id="placeName" type="text" />
              <ErrorMessage name="placeName" />

              <button
                className="my-2 bg-lime-500 enabled:hover:bg-lime-400 text-white font-bold py-2 px-4 border-b-4 border-lime-700 enabled:hover:border-lime-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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

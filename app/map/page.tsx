import { getParamCampusBounds } from "@/utils/getParamCampusBounds";

import PlacesJSON from "../../data/places.json";

import MapComponent from "./map";

export default async function Page({ searchParams }: { searchParams: { campus?: string; place?: string } }) {
  const campusBounds = getParamCampusBounds(searchParams.campus ?? null);
  let paramPlaceId: string | undefined = searchParams?.place;
  let paramPlace = null;

  for (const place of PlacesJSON.features) {
    if (place.properties.identifier === paramPlaceId) {
      paramPlace = place;
    }
  }

  return (
    <>
      <main spellCheck="false" className="h-full w-full">
        <MapComponent Places={PlacesJSON} paramCampusBounds={campusBounds} paramPlace={paramPlace} />
      </main>
    </>
  );
}

export const runtime = "edge";

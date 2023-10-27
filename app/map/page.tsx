import get10MinuteCachedToken from "@/utils/getMapboxToken";

import PlacesJSON from "../../data/places.json";

import MapComponent from "./map";

export default async function Page() {
  const mapboxToken = await get10MinuteCachedToken();

  return (
    <>
      <main className="h-full w-full">
        <MapComponent Places={PlacesJSON} mapboxToken={mapboxToken} />
      </main>
    </>
  );
}

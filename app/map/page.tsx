import getMapboxToken from "@/utils/getMapboxToken";

import PlacesJSON from "../../data/places.json";

import MapComponent from "./map";

export default async function Page() {
  const mapboxToken = await getMapboxToken();

  return (
    <>
      <main className="h-full w-full">
        <MapComponent Places={PlacesJSON} mapboxToken={mapboxToken} />
      </main>
    </>
  );
}

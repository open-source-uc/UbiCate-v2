import PlacesJSON from "../../data/places.json";

import MapComponent from "./map";

export default async function Page() {
  return (
    <>
      <main className="h-full w-full">
        <MapComponent Places={PlacesJSON} />
      </main>
    </>
  );
}

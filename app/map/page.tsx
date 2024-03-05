import PlacesJSON from "../../data/places.json";

import MapComponent from "./map";

export default async function Page() {
  return (
    <>
      <main spellCheck="false" className="h-full w-full">
        <MapComponent Places={PlacesJSON} />
      </main>
    </>
  );
}

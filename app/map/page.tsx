import PlacesJSON from "../../data/places.json";

import Map from "./map";

export default async function Page() {
  return <Map Places={PlacesJSON} />;
}

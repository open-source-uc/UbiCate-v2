import PlacesJSON from "../../data/places.json";

// import Map from "./map";
import MapComponent from "./map";

export default async function Page() {
  return (
    <>
      {/* <Map Places={PlacesJSON} /> */}
      <div className="h-full w-full">
        <MapComponent Places={PlacesJSON} />
      </div>
    </>
  );
}

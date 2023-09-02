import Image from "next/image";

import { Marker as MapboxMarker } from "react-map-gl";

export default function Marker({ place }: { place: any }) {
  //console.log(place.geometry.coordinates[0]);
  console.log(place.geometry, place);
  return (
    <MapboxMarker latitude={place.geometry.coordinates[1]} longitude={place.geometry.coordinates[0]}>
      <Image className="" src="/logo-white.svg" alt="Logo" width={20} height={20} />
    </MapboxMarker>
  );
}

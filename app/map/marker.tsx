import Image from "next/image";

import { Marker as MapboxMarker } from "react-map-gl";

export default function Marker({ place }: { place: any }) {
  return (
    <MapboxMarker latitude={place.geometry.coordinates[1]} longitude={place.geometry.coordinates[0]} offset={[0, -18]}>
      <Image className="" src="/logo-white.svg" alt="Logo" width={20} height={20} />
    </MapboxMarker>
  );
}

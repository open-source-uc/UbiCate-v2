import Image from "next/image";

import { Marker as MapboxMarker } from "react-map-gl";

interface MarkerProps {
  place: any;
  onClick: (place: any) => void;
}

export default function Marker({ place, onClick }: MarkerProps) {
  return (
    <MapboxMarker
      latitude={place.geometry.coordinates[1]}
      longitude={place.geometry.coordinates[0]}
      offset={[0, -18]}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
        onClick(place);
      }}
    >
      <Image className="dark:invert" src="/logo.svg" alt="Logo" width={20} height={29} />
    </MapboxMarker>
  );
}

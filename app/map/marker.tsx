import Image from "next/image";

import { Marker as MapboxMarker } from "react-map-gl";

import { Feature } from "../../utils/types";

interface MarkerProps {
  place: Feature;
  onClick: (place: Feature) => void;
  onMouseEnter: (place: Feature | null) => void;
}

export default function Marker({ place, onClick, onMouseEnter }: MarkerProps) {
  return (
    <MapboxMarker
      latitude={place.geometry.coordinates[1]}
      longitude={place.geometry.coordinates[0]}
      offset={[0, -18]}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        window.history.replaceState(null, "", `?place=${place.properties.identifier}`)
        onClick(place);
      }}
    >
      <div
        onMouseEnter={() => {
          onMouseEnter(place);
        }}
        onMouseLeave={() => {
          onMouseEnter(null);
        }}
      >
        <Image className="dark:invert" src="/logo.svg" alt="Logo" width={20} height={29} />
      </div>
    </MapboxMarker>
  );
}

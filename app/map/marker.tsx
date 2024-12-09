import Image from "next/image";

import { Marker as MapboxMarker } from "react-map-gl";

import { Feature } from "../../utils/types";

interface MarkerProps {
  place: Feature;
  onClick: (place: Feature) => void;
  onMouseEnter?: (place: Feature | null) => void;
}

export default function Marker({ place, onClick, onMouseEnter }: MarkerProps) {
  return (
    <MapboxMarker latitude={place.geometry.coordinates[1]} longitude={place.geometry.coordinates[0]} offset={[0, -18]}>
      <div
        onMouseEnter={() => {
          if (onMouseEnter) onMouseEnter(place);
        }}
        onMouseLeave={() => {
          if (onMouseEnter) onMouseEnter(null);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick(place);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick(place);
        }}
      >
        <Image className="dark:invert" src="/logo.svg" alt="Logo" width={20} height={29} />
      </div>
    </MapboxMarker>
  );
}

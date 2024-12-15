import Image from "next/image";

import { Marker as MapboxMarker } from "react-map-gl";
import type { MarkerDragEvent } from "react-map-gl";

import { Feature } from "../../utils/types";

interface MarkerProps {
  place: Feature;
  draggable?: boolean;
  onClick: (place: Feature) => void;
  onMouseEnter?: (place: Feature | null) => void;
  onDrag?: (e: MarkerDragEvent) => void;
  onDragEnd?: (e: MarkerDragEvent) => void;
}

export default function Marker({ place, draggable = false, onClick, onMouseEnter, onDrag, onDragEnd }: MarkerProps) {
  return (
    <MapboxMarker
      latitude={place.geometry.coordinates[1]}
      longitude={place.geometry.coordinates[0]}
      offset={[0, -18]}
      draggable={draggable}
      onDrag={(e) => onDrag?.(e)}
      onDragEnd={(e) => onDragEnd?.(e)}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(place);
      }}
    >
      <div
        onMouseEnter={() => {
          if (onMouseEnter) onMouseEnter(place);
        }}
        onMouseLeave={() => {
          if (onMouseEnter) onMouseEnter(null);
        }}
      >
        <Image className="dark:invert" src="/logo.svg" alt="Logo" width={20} height={29} />
      </div>
    </MapboxMarker>
  );
}

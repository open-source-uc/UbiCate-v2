import Image from "next/image";

import { Marker as MapboxMarker } from "react-map-gl";
import type { MarkerDragEvent } from "react-map-gl";

import { Feature, PointFeature } from "../../utils/types";

interface MarkerProps {
  place: PointFeature;
  draggable?: boolean;
  onClick: (place: Feature) => void;
  onMouseEnter?: (place: Feature | null) => void;
  onDrag?: (e: MarkerDragEvent) => void;
  onDragEnd?: (e: MarkerDragEvent) => void;
}

// Mapeo de nombres a archivos SVG
const nameToSvgMap: Record<string, string> = {
  Acceso: "/categoryIcons/acceso.svg",
  Salida: "/categoryIcons/salida.svg",
  "Acceso/Salida": "/acceso_y_salida.svg",
};

const defaultSvg = "/logo.svg";

export default function Marker({ place, draggable = false, onClick, onMouseEnter, onDrag, onDragEnd }: MarkerProps) {
  const matchedKey = Object.keys(nameToSvgMap).find((key) => place.properties.name.includes(key));
  const svgPath = matchedKey ? nameToSvgMap[matchedKey] : defaultSvg;

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
        <Image className="dark:invert" src={svgPath} alt={place.properties.name} width={20} height={29} />
      </div>
    </MapboxMarker>
  );
}

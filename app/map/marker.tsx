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

// Mapeo de nombres a colores
const nameToColorMap: Record<string, string> = {
  Acceso: "bg-blue-location",
  Salida: "bg-blue-location",
  "Acceso/Salida": "bg-blue-location",
  Baño: "bg-deep-cyan-option",
  Comida: "bg-orange-option",
  Agua: "bg-cyan-option",
  Crisol: "bg-purple-option",
  Facultad: "bg-deep-red-option",
  Biblioteca: "bg-pink-option",
  "Sala de estudio": "bg-red-option" /* Sala de estudio */,
  Auditorio: "bg-green-option",
  Multicancha: "bg-deep-green-option" /* Deportes */,
  Estacionamiento: "bg-gray-option",
};

// Mapeo de nombres a archivos SVG
const nameToSvgMap: Record<string, string> = {
  Acceso: "arrow_upward",
  Salida: "arrow_upward",
  "Acceso/Salida": "arrow_upward",
  Baño: "wc",
  Comida: "restaurant",
  Agua: "local_drink",
  Crisol: "print",
  Facultad: "school",
  Biblioteca: "local_library",
  "Sala de estudio": "group" /* Sala de estudio */,
  Auditorio: "book_2",
  Multicancha: "sports_soccer" /* Deportes */,
  Estacionamiento: "local_parking",
};

const defaultSvg = "fiber_manual_record";

export default function Marker({ place, draggable = false, onClick, onMouseEnter, onDrag, onDragEnd }: MarkerProps) {
  const matchedKey = Object.keys(nameToSvgMap).find((key) => place.properties.name.includes(key));
  const svgPath = matchedKey ? nameToSvgMap[matchedKey] : defaultSvg;
  const color = matchedKey ? nameToColorMap[matchedKey] : "bg-brown-light";

  {
    /* Checks if the background color is too dark or too white, in order to change the icon color and make more accesible the map*/
  }
  const darkBackgrounds = [
    "bg-brown-dark",
    "bg-purple-option",
    "bg-deep-green-option",
    "bg-deep-cyan-option",
    "bg-deep-red-option",
    "bg-gray-option",
  ];
  const textColorClass = darkBackgrounds.includes(color) ? "text-white-ubi" : "text-brown-dark";

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
        <div
          className={`flex items-center justify-center w-4 h-4 rounded-full pointer-events-auto cursor-pointer ${color} ${textColorClass} ring-brown-dark ring-1`}
        >
          {/* The hardcoded style is not the most efficient or pretty way to do it, but it's the way to change the size using Material Symbols. text-sm did not work*/}
          <span style={{ fontSize: "0.8rem" }} className="material-symbols-outlined">
            {svgPath}
          </span>
        </div>
      </div>
    </MapboxMarker>
  );
}

/* <Image className="" src={svgPath} alt={place.properties.name} width={20} height={29} /> */

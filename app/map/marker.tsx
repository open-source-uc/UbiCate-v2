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
const categoryToColorMap: Record<string, string> = {
  bath: "bg-deep-cyan-option",
  food_lunch: "bg-orange-option",
  water: "bg-cyan-option",
  computers: "bg-purple-option",
  Facultad: "bg-deep-red-option",
  library: "bg-pink-option",
  studyroom: "bg-red-option",
  auditorium: "bg-green-option",
  sports_place: "bg-deep-green-option",
  parking: "bg-gray-option",
  userLocation: "bg-cyan-option",
};

// Mapeo de nombres a archivos SVG
const categoryToSvgMap: Record<string, string> = {
  bath: "wc",
  food_lunch: "restaurant",
  water: "local_drink",
  computers: "print",
  Facultad: "school",
  library: "local_library",
  studyroom: "group",
  auditorium: "book_2",
  sports_place: "sports_soccer",
  parking: "local_parking",
  userLocation: "radio_button_checked",
};

const defaultSvg = "fiber_manual_record";

export default function Marker({ place, draggable = false, onClick, onMouseEnter, onDrag, onDragEnd }: MarkerProps) {
  const primaryCategory = place.properties.categories[0];
  const svgPath = primaryCategory && categoryToSvgMap[primaryCategory] ? categoryToSvgMap[primaryCategory] : defaultSvg;

  const color =
    primaryCategory && categoryToColorMap[primaryCategory] ? categoryToColorMap[primaryCategory] : "bg-brown-light";

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

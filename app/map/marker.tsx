import React from "react";

import { Marker as MapboxMarker } from "react-map-gl/maplibre";
import type { MarkerDragEvent } from "react-map-gl/maplibre";

import { Feature, PointFeature } from "@/utils/types";

interface MarkerProps {
  place: PointFeature;
  icon: React.ReactElement;
  draggable?: boolean;
  onClick: (place: Feature) => void;
  onMouseEnter?: (place: Feature | null) => void;
  onDrag?: (e: MarkerDragEvent) => void;
  onDragEnd?: (e: MarkerDragEvent) => void;
  offset?: [number, number]; // Added offset prop
}

// Mapeo de nombres a colores
const categoryToColorMap: Record<string, string> = {
  auditorium: "bg-green-option",
  water: "bg-cyan-option",
  bath: "bg-deep-cyan-option",
  food_lunch: "bg-orange-option",
  computers: "bg-purple-option",
  Facultad: "bg-deep-red-option",
  library: "bg-pink-option",
  studyroom: "bg-red-option",
  sports_place: "bg-deep-green-option",
  parking: "bg-gray-option",
  userLocation: "bg-cyan-option",
  customMark: "bg-pink-option",
};

export default function Marker({
  place,
  draggable = false,
  onClick,
  onMouseEnter,
  onDrag,
  onDragEnd,
  icon,
  offset = [0, 0],
}: MarkerProps) {
  const primaryCategory = place.properties.categories[0];

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
      offset={offset}
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
          className={`flex items-center justify-center rounded-full pointer-events-auto cursor-pointer ${color} ${textColorClass} ring-brown-dark ring-1 w-4 h-4 z-50`}
        >
          {icon}
        </div>
      </div>
    </MapboxMarker>
  );
}

/* <Image className="" src={svgPath} alt={place.properties.name} width={20} height={29} /> */

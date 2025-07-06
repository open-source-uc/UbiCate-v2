import React from "react";

import { Marker as MapboxMarker } from "react-map-gl";
import type { MarkerDragEvent } from "react-map-gl";

import { getMarkerColorByCategory } from "@/app/components/sidebar/category/categoryConfig";
import { Feature, PointFeature, CATEGORIES } from "@/utils/types";

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

  // Use centralized color mapping
  const getMarkerColor = (category: string): string => {
    // Try to match with CATEGORIES enum
    const categoryEnum = Object.values(CATEGORIES).find((cat) => cat === category);
    if (categoryEnum) {
      return getMarkerColorByCategory(categoryEnum);
    }

    // Fallback to default color
    return "bg-background";
  };

  const color = primaryCategory ? getMarkerColor(primaryCategory) : "bg-primary";

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

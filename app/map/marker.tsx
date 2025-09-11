import React from "react";

import { Marker as MapboxMarker } from "react-map-gl/maplibre";
import type { MarkerDragEvent } from "react-map-gl/maplibre";

import { getCategoryColor } from "@/lib/map/categoryToColors";
import { CATEGORIES, Feature, PointFeature } from "@/lib/types";

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
  const color = getCategoryColor(primaryCategory.toLowerCase().trim() as CATEGORIES);
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
          className={`flex items-center justify-center rounded-full pointer-events-auto cursor-pointer ring-secondary ring-1 w-5 h-5 z-50 ${color}`}
        >
          {icon}
        </div>
      </div>
    </MapboxMarker>
  );
}

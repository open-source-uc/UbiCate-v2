import { Marker as MapboxMarker } from "react-map-gl/maplibre";

import { PLACE_ICONS } from "../../utils/constants";
import { alwaysVisiblePlaces } from "../../utils/places";
import { Feature, PointFeature } from "../../utils/types";
import * as Icons from "../components/ui/icons/icons";
import { useSidebar } from "../context/sidebarCtx";

interface SpecialMarkerProps {
  place: PointFeature;
  onClick: (place: Feature) => void;
  onMouseEnter?: (place: Feature | null) => void;
  draggable?: boolean;
  offset?: [number, number];
}

function SpecialMarker({
  place,
  onClick,
  onMouseEnter,

  draggable = false,
  offset = [0, 0],
}: SpecialMarkerProps) {
  const iconConfig = PLACE_ICONS[place.properties.identifier];
  const Icon = iconConfig ? (Icons as any)[iconConfig.icon] ?? Icons.Default : Icons.Default;

  return (
    <MapboxMarker
      latitude={place.geometry.coordinates[1]}
      longitude={place.geometry.coordinates[0]}
      offset={offset}
      draggable={draggable}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(place);
      }}
    >
      <div
        onMouseEnter={() => onMouseEnter?.(place)}
        onMouseLeave={() => onMouseEnter?.(null)}
        className="flex items-center justify-center cursor-pointer pointer-events-auto"
      >
        <div className="z-50">{<Icon className={iconConfig?.size ?? "w-8 h-8"} />}</div>
      </div>
    </MapboxMarker>
  );
}

export default function SpecialMarkers() {
  const { setSelectedPlace } = useSidebar();

  return (
    <>
      {alwaysVisiblePlaces.map((place) => (
        <SpecialMarker key={place.properties.identifier} place={place} onClick={() => setSelectedPlace(place)} />
      ))}
    </>
  );
}

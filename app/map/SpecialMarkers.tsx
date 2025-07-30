import { Marker as MapboxMarker } from "react-map-gl/maplibre";

import { PLACE_ICONS } from "../../utils/constants";
import { alwaysVisiblePlaces } from "../../utils/places";
import * as Icons from "../components/icons/icons";

export default function SpecialMarkers() {
  return (
    <>
      {alwaysVisiblePlaces.map((place) => {
        const id = place.properties.identifier;
        const iconConfig = PLACE_ICONS[id];
        const Icon = iconConfig ? (Icons as any)[iconConfig.icon] ?? Icons.Default : Icons.Default;

        return (
          <MapboxMarker key={id} latitude={place.geometry.coordinates[1]} longitude={place.geometry.coordinates[0]}>
            <div className="marker">
              <Icon className={iconConfig?.size ?? "w-8 h-8"} />
            </div>
          </MapboxMarker>
        );
      })}
    </>
  );
}

import { LineFeature } from "@/utils/types";

import RouteInfoMarker from "./infoMarker";
import RouteLayer from "./routeLayer";
import StartMarker from "./startMarker";

interface DirectionsComponentProps {
  route: LineFeature | null;
  duration: number | null;
  distance: number | null;
}

export default function DirectionsComponent({ route, duration, distance }: DirectionsComponentProps) {
  return (
    <>
      {route ? <RouteLayer route={route} /> : null}
      {route && duration && distance ? <RouteInfoMarker route={route} duration={duration} distance={distance} /> : null}
      {route ? <StartMarker route={route} /> : null}
    </>
  );
}

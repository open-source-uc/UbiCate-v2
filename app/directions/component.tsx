import { useDirections } from "../context/directionsCtx";

import RouteLayer from "./routeLayer";

export default function DirectionsComponent() {
  const { route: route } = useDirections();

  return <>{route ? <RouteLayer route={route} /> : null}</>;
}

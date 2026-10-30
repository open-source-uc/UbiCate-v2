import { useDirections } from "@/app/context/directionsCtx";

import RouteLayer from "./routeLayer";

export default function DirectionsComponent() {
  const { routes, selectedRouteId, route } = useDirections();

  if (!route || !selectedRouteId) return null;

  const alternatives = routes.filter((item) => item.id !== selectedRouteId);

  return (
    <>
      <RouteLayer route={route} idPrefix="directions-selected" />

      {alternatives.map((item) => (
        <RouteLayer
          key={item.id}
          beforeId="directions-selected-border"
          route={item.direction}
          idPrefix={`directions-${item.id}`}
          color="#94A3B8"
          borderColor="#FFFFFF"
        />
      ))}
    </>
  );
}

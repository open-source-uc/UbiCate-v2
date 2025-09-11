import { useQuery } from "@tanstack/react-query";

import { LineFeature } from "@/lib/types";

export const fetchDirection = async (
  start: [number, number],
  end: [number, number],
  walkwayBias: number,
): Promise<{ direction: LineFeature; duration: number; distance: number }> => {
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&steps=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&walkway_bias=${walkwayBias}`,
  );
  if (!response.ok) {
    throw new Error(`Error fetching directions: ${response.statusText}`);
  }

  const data: any = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("No routes found");
  }

  const direction: LineFeature = {
    type: "Feature",
    properties: {},
    geometry: data.routes[0].geometry,
  };

  const durationMin = Math.floor(data.routes[0].duration / 60);
  const distanceMt = Math.floor(data.routes[0].distance);

  return {
    direction,
    duration: durationMin,
    distance: distanceMt,
  };
};

export const useOptimalDirection = (start: [number, number], end: [number, number], enabled: boolean = true) => {
  const defaultDirection = useQuery({
    queryKey: ["direction", start, end, 0],
    queryFn: async () => {
      return fetchDirection(start, end, 0);
    },
    enabled,
    staleTime: 1000 * 60 * 60,
    gcTime: 10 * 60 * 1000,
  });

  const biasedDirection = useQuery({
    queryKey: ["direction", start, end, -0.2],
    queryFn: async () => {
      return fetchDirection(start, end, -0.2);
    },
    enabled,
    staleTime: 1000 * 60 * 60,
    gcTime: 10 * 60 * 1000,
  });

  const isLoading = defaultDirection.isLoading || biasedDirection.isLoading;

  const error = defaultDirection.error || biasedDirection.error;

  const optimalRoute = (() => {
    if (!defaultDirection.data || !biasedDirection.data) {
      return defaultDirection.data || biasedDirection.data || null;
    }

    if (biasedDirection.data.duration < defaultDirection.data.duration) {
      return biasedDirection.data;
    }

    return defaultDirection.data;
  })();

  return {
    data: optimalRoute,
    isLoading,
    error,
    defaultDirection: defaultDirection.data,
    biasedDirection: biasedDirection.data,
  };
};

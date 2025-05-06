import { LineFeature } from "@/utils/types";

export const fetchDirection = async (
  start: [number, number],
  end: [number, number],
): Promise<{ direction: LineFeature; duration: number; distance: number }> => {
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&steps=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&overview=full`,
    {
      cache: "force-cache",
    },
  );
  const data = await response.json();
  const code = data.code;

  if (code !== "Ok") {
    throw new Error(`Error fetching directions: ${code} - ${data.message || "Unknown error"}`);
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

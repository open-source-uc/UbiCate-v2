import { useQuery } from "@tanstack/react-query";

export interface DirectionRoute {
  id: string;
  direction: {
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
    };
  };
  duration: number;
  distance: number;
}

interface DirectionResponse {
  routes: DirectionRoute[];
}

export const fetchDirection = async (start: [number, number], end: [number, number]): Promise<DirectionRoute[]> => {
  const response = await fetch("/api/pedestrian-route", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ start, end }),
  });

  if (!response.ok) {
    const data = (await response.json()) as {
      error?: string;
      routes?: DirectionRoute[];
    };
    throw new Error(data.error || "Error calculando la ruta");
  }

  const data: DirectionResponse = await response.json();

  if (!data.routes?.length) {
    throw new Error("No se encontraron rutas.");
  }

  return data.routes;
};

export const useOptimalDirection = (start: [number, number], end: [number, number], enabled = true) => {
  return useQuery({
    queryKey: ["direction", start, end],
    queryFn: () => fetchDirection(start, end),
    enabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

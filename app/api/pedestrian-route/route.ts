import { NextResponse } from "next/server";

interface RouteRequest {
  start: unknown;
  end: unknown;
}

interface ValhallaRoute {
  distance: number;
  duration: number;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}

interface ValhallaResponse {
  code: string;
  routes: ValhallaRoute[];
}

const VALHALLA_URL = process.env.VALHALLA_URL ?? "http://localhost:8002";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RouteRequest;
    const { start, end } = body;

    const isValidCoordinate = (point: unknown): point is [number, number] =>
      Array.isArray(point) &&
      point.length === 2 &&
      point.every((value) => typeof value === "number" && Number.isFinite(value));

    if (!isValidCoordinate(start) || !isValidCoordinate(end)) {
      return NextResponse.json({ error: "Coordenadas de origen o destino inválidas." }, { status: 400 });
    }

    const response = await fetch(`${VALHALLA_URL}/route`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locations: [
          { lon: start[0], lat: start[1] },
          { lon: end[0], lat: end[1] },
        ],
        costing: "pedestrian",
        units: "kilometers",
        language: "es-ES",
        format: "osrm",
        shape_format: "geojson",
        alternates: 2,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Valhalla error:", error);

      return NextResponse.json({ error: "No fue posible calcular la ruta." }, { status: 502 });
    }

    const data = (await response.json()) as ValhallaResponse;

    if (data.code !== "Ok" || !data.routes?.length) {
      return NextResponse.json({ error: "No se encontraron rutas peatonales." }, { status: 404 });
    }

    const routes = data.routes.map((route: any, index: number) => ({
      id: `route-${index}`,
      direction: {
        type: "Feature",
        properties: {},
        geometry: route.geometry,
      },
      duration: Math.round(route.duration / 60),
      distance: Math.round(route.distance),
    }));

    return NextResponse.json({ routes });
  } catch (error) {
    console.error("Pedestrian route error:", error);

    return NextResponse.json({ error: "Error interno al calcular la ruta." }, { status: 500 });
  }
}

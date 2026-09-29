export type TransformTool = "move" | "rotate";

type Coord = [number, number];
type LngLat = { lng: number; lat: number };

// Las dos transformaciones se calculan siempre contra la foto `coords` tomada al empezar el arrastre y
// la posición inicial del puntero, nunca de forma incremental: así no se acumula error entre movimientos.

function translate(coords: Coord[], start: LngLat, current: LngLat): Coord[] {
  const dLng = current.lng - start.lng;
  const dLat = current.lat - start.lat;
  return coords.map(([lng, lat]) => [lng + dLng, lat + dLat]);
}

// Gira alrededor del centro del bounding box, por el ángulo que barre el puntero visto desde ese centro.
// ⚠️ El giro se hace con el lng escalado por cos(lat): en grados crudos un grado de lng mide menos que uno
// de lat y la figura se deformaría (un cuadrado saldría romboide) en vez de rotar.
function rotate(coords: Coord[], start: LngLat, current: LngLat): Coord[] {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  const cLng = (minLng + maxLng) / 2;
  const cLat = (minLat + maxLat) / 2;
  const kx = Math.cos((cLat * Math.PI) / 180);

  const angleOf = (p: LngLat) => Math.atan2(p.lat - cLat, (p.lng - cLng) * kx);
  const theta = angleOf(current) - angleOf(start);
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  return coords.map(([lng, lat]) => {
    const x = (lng - cLng) * kx;
    const y = lat - cLat;
    return [cLng + (x * cos - y * sin) / kx, cLat + x * sin + y * cos];
  });
}

export const TRANSFORMS: Record<TransformTool, (coords: Coord[], start: LngLat, current: LngLat) => Coord[]> = {
  move: translate,
  rotate,
};

// Rotar un solo punto no hace nada; mover sí.
export const TRANSFORM_MIN_PINS: Record<TransformTool, number> = { move: 1, rotate: 2 };

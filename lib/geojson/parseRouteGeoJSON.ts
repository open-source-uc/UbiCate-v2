export type RouteCoord = [number, number];

export type ParseRouteGeoJSONResult =
  { ok: true; coords: RouteCoord[]; notes: string[] } | { ok: false; error: string };

// Una coordenada GeoJSON puede traer altitud como tercer elemento: se descarta.
function toCoord(value: unknown): RouteCoord | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const [lng, lat] = value;
  if (typeof lng !== "number" || typeof lat !== "number") return null;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return null;
  return [lng, lat];
}

function toCoordList(value: unknown): RouteCoord[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const coords: RouteCoord[] = [];
  for (const item of value) {
    const coord = toCoord(item);
    if (!coord) return null;
    coords.push(coord);
  }
  return coords;
}

interface Collected {
  lines: RouteCoord[][];
  points: RouteCoord[];
}

// Recorre cualquier forma de GeoJSON (Feature, FeatureCollection, geometría suelta,
// GeometryCollection o un array pelado de coordenadas) y junta lo que sirve para una ruta.
// Polígonos se ignoran a propósito: un área no es un recorrido y su anillo cerrado daría un
// trazado que vuelve sobre sí mismo.
function collect(node: unknown, out: Collected, depth = 0): void {
  if (depth > 6 || node === null || typeof node !== "object") return;

  if (Array.isArray(node)) {
    const coords = toCoordList(node);
    if (coords) {
      if (coords.length === 1) out.points.push(coords[0]);
      else out.lines.push(coords);
      return;
    }
    for (const item of node) collect(item, out, depth + 1);
    return;
  }

  const obj = node as Record<string, unknown>;

  switch (obj.type) {
    case "FeatureCollection":
      collect(obj.features, out, depth + 1);
      return;
    case "Feature":
      collect(obj.geometry, out, depth + 1);
      return;
    case "GeometryCollection":
      collect(obj.geometries, out, depth + 1);
      return;
    case "LineString": {
      const coords = toCoordList(obj.coordinates);
      if (coords && coords.length >= 2) out.lines.push(coords);
      return;
    }
    case "MultiLineString": {
      if (!Array.isArray(obj.coordinates)) return;
      for (const part of obj.coordinates) {
        const coords = toCoordList(part);
        if (coords && coords.length >= 2) out.lines.push(coords);
      }
      return;
    }
    case "Point": {
      const coord = toCoord(obj.coordinates);
      if (coord) out.points.push(coord);
      return;
    }
    case "MultiPoint": {
      const coords = toCoordList(obj.coordinates);
      if (coords) out.points.push(...coords);
      return;
    }
    default:
      return;
  }
}

function dropConsecutiveDuplicates(coords: RouteCoord[]): RouteCoord[] {
  return coords.filter((coord, i) => i === 0 || coord[0] !== coords[i - 1][0] || coord[1] !== coords[i - 1][1]);
}

// Muestreo uniforme que conserva el primer y el último vértice. Se prefiere a cortar en `max`
// porque un GeoJSON trazado en otra herramienta suele traer cientos de vértices, y truncarlo
// dejaría media ruta en silencio.
function downsample(coords: RouteCoord[], max: number): RouteCoord[] {
  const step = (coords.length - 1) / (max - 1);
  const out: RouteCoord[] = [];
  for (let i = 0; i < max; i++) out.push(coords[Math.round(i * step)]);
  return dropConsecutiveDuplicates(out);
}

export function parseRouteGeoJSON(raw: string, maxPoints: number): ParseRouteGeoJSONResult {
  if (raw.trim().length === 0) return { ok: false, error: "Pega un GeoJSON para importar." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "No se pudo leer: revisa que sea JSON válido." };
  }

  const collected: Collected = { lines: [], points: [] };
  collect(parsed, collected, 0);

  const notes: string[] = [];
  let coords: RouteCoord[];

  if (collected.lines.length > 0) {
    coords = collected.lines.flat();
    if (collected.lines.length > 1) {
      notes.push(`Se unieron ${collected.lines.length} tramos en un solo trazado, en el orden del archivo.`);
    }
  } else if (collected.points.length >= 2) {
    coords = collected.points;
    notes.push(`Se usaron ${collected.points.length} puntos en el orden del archivo.`);
  } else {
    return {
      ok: false,
      error: "No se encontró un trazado. Se aceptan LineString, MultiLineString o al menos 2 puntos.",
    };
  }

  coords = dropConsecutiveDuplicates(coords);
  if (coords.length < 2) return { ok: false, error: "La ruta necesita al menos 2 puntos distintos." };

  if (coords.length > maxPoints) {
    const original = coords.length;
    coords = downsample(coords, maxPoints);
    notes.push(`Traía ${original} puntos: se redujo a ${coords.length} (el máximo) conservando la forma.`);
  }

  return { ok: true, coords, notes };
}

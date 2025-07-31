import PlacesJSON from "./places";
import { point, polygon, booleanPointInPolygon } from "@turf/turf";

interface CampusBounds {
  longitudeRange: [number, number];
  latitudeRange: [number, number];
}

const campusBounds: Record<string, CampusBounds> = {
  SJ: { longitudeRange: [-70.6171, -70.6043], latitudeRange: [-33.5021, -33.4952] },
  LC: { longitudeRange: [-70.6198, -70.6154], latitudeRange: [-33.4207, -33.4178] },
  VR: { longitudeRange: [-72.2264, -72.2244], latitudeRange: [-39.2787, -39.2771] },
  CC: { longitudeRange: [-70.6424, -70.6386], latitudeRange: [-33.4427, -33.4403] },
  OR: { longitudeRange: [-70.597, -70.5902], latitudeRange: [-33.4477, -33.4435] },
  SanJoaquin: { longitudeRange: [-70.6171, -70.6043], latitudeRange: [-33.5021, -33.4952] },
  LoContador: { longitudeRange: [-70.6198, -70.6154], latitudeRange: [-33.4207, -33.4178] },
  Villarrica: { longitudeRange: [-72.2264, -72.2244], latitudeRange: [-39.2787, -39.2771] },
  CasaCentral: { longitudeRange: [-70.6424, -70.6386], latitudeRange: [-33.4427, -33.4403] },
  Oriente: { longitudeRange: [-70.597, -70.5902], latitudeRange: [-33.4477, -33.4435] },
};

const campusMaxBounds: Record<string, CampusBounds> = {
  SJ: {
    longitudeRange: [-70.6205028, -70.5913170],
    latitudeRange: [-33.5078278, -33.4879484]
  },
  LC: {
    longitudeRange: [-70.6223158, -70.6096562],
    latitudeRange: [-33.4286518, -33.4065652]
  },
  VR: {
    longitudeRange: [-72.22701952051408, -72.2242192943034],
    latitudeRange: [-39.278605924710156, -39.276849411532424]
  },
  CC: {
    longitudeRange: [-70.6470478, -70.6323672],
    latitudeRange: [-33.4500328, -33.4311542]
  },
  OR: {
    longitudeRange: [-70.60228168760007, -70.58052647213087],
    latitudeRange: [-33.45132213922094, -33.44061912671008]
  },
  SanJoaquin: {
    longitudeRange: [-70.6205028, -70.5913170],
    latitudeRange: [-33.5078278, -33.4879484]
  },
  LoContador: {
    longitudeRange: [-70.6223158, -70.6096562],
    latitudeRange: [-33.4286518, -33.4065652]
  },
  Villarrica: {
    longitudeRange: [-72.22701952051408, -72.2242192943034],
    latitudeRange: [-39.278605924710156, -39.276849411532424]
  },
  CasaCentral: {
    longitudeRange: [-70.6470478, -70.6323672],
    latitudeRange: [-33.4500328, -33.4311542]
  },
  Oriente: {
    longitudeRange: [-70.60228168760007, -70.58052647213087],
    latitudeRange: [-33.45132213922094, -33.44061912671008]
  },
};


export function getMaxCampusBoundsFromName(paramCampus: string | null): [number, number, number, number] {
  if (!paramCampus || !Object.keys(campusMaxBounds).includes(paramCampus)) {
    paramCampus = "SanJoaquin";
  }
  const campusMapMaxBounds: [number, number, number, number] = [
    campusMaxBounds[paramCampus].longitudeRange[0],
    campusMaxBounds[paramCampus].latitudeRange[0],
    campusMaxBounds[paramCampus].longitudeRange[1],
    campusMaxBounds[paramCampus].latitudeRange[1],
  ];
  return campusMapMaxBounds;
}

export function getMaxCampusBoundsFromPoint(longitude: number, latitude: number): [number, number, number, number] {
  for (const [boundaryCampus, boundary] of Object.entries(campusMaxBounds)) {
    if (
      longitude >= boundary.longitudeRange[0] &&
      longitude <= boundary.longitudeRange[1] &&
      latitude >= boundary.latitudeRange[0] &&
      latitude <= boundary.latitudeRange[1]
    ) {
      return [
        campusMaxBounds[boundaryCampus].longitudeRange[0],
        campusMaxBounds[boundaryCampus].latitudeRange[0],
        campusMaxBounds[boundaryCampus].longitudeRange[1],
        campusMaxBounds[boundaryCampus].latitudeRange[1],
      ];
    }
  }

  return [
    campusMaxBounds["SJ"].longitudeRange[0],
    campusMaxBounds["SJ"].latitudeRange[0],
    campusMaxBounds["SJ"].longitudeRange[1],
    campusMaxBounds["SJ"].latitudeRange[1],
  ];
}

export function getCampusBoundsFromName(paramCampus: string | null): [number, number, number, number] {
  if (!paramCampus || !Object.keys(campusBounds).includes(paramCampus)) {
    paramCampus = "SanJoaquin";
  }
  const campusMapBounds: [number, number, number, number] = [
    campusBounds[paramCampus].longitudeRange[0],
    campusBounds[paramCampus].latitudeRange[0],
    campusBounds[paramCampus].longitudeRange[1],
    campusBounds[paramCampus].latitudeRange[1],
  ];
  return campusMapBounds;
}

export function getCampusBoundsFromPoint(longitude: number, latitude: number): [number, number, number, number] | null {
  for (const [boundaryCampus, boundary] of Object.entries(campusBounds)) {
    if (
      longitude >= boundary.longitudeRange[0] &&
      longitude <= boundary.longitudeRange[1] &&
      latitude >= boundary.latitudeRange[0] &&
      latitude <= boundary.latitudeRange[1]
    ) {
      return [
        campusBounds[boundaryCampus].longitudeRange[0],
        campusBounds[boundaryCampus].latitudeRange[0],
        campusBounds[boundaryCampus].longitudeRange[1],
        campusBounds[boundaryCampus].latitudeRange[1],
      ];
    }
  }

  return null
}

export function getCampusNameFromPoint(longitude: number, latitude: number): string | null {
  for (const [boundaryCampus, boundary] of Object.entries(campusMaxBounds)) {
    if (
      longitude >= boundary.longitudeRange[0] &&
      longitude <= boundary.longitudeRange[1] &&
      latitude >= boundary.latitudeRange[0] &&
      latitude <= boundary.latitudeRange[1]
    ) {
      return boundaryCampus
    }
  }

  return null
}

export function getFacultiesIdsFromPoint(longitude: number, latitude: number): string[] {
  // Crea un punto con las coordenadas proporcionadas
  const p = point([longitude, latitude]);

  // Array para almacenar los nombres de las facultades
  const facultyNames: string[] = [];

  // Itera sobre los features y busca las facultades que tengan la categoría "faculty"
  // y cuyo polígono contenga el punto.
  for (const feature of PlacesJSON.features) {
    // Verifica si la categoría incluye "faculty" y si la geometría es un Polígono
    if (feature.properties.categories.includes("faculty") && feature.geometry.type === "Polygon") {
      // Crea un polígono con las coordenadas del feature
      const p2 = polygon(feature.geometry.coordinates);


      // Verifica si el punto está dentro del polígono
      if (booleanPointInPolygon(p, p2)) {
        // Agrega el nombre de la facultad al array
        facultyNames.push(feature.properties.identifier);
      }
    }
  }

  // Retorna el array de nombres de facultades (vacío si no hay coincidencias)
  return facultyNames;
}
// Solo son dos pues a fecha de 2 de mayo del 2025, son los unicos campus que tienen rutas
const campusEntryPoints: Record<string, [number, number]> = {
  SJ: [-70.61564953541995, -33.498485323162896],
  LC: [-70.61785030163261, -33.41986777583937],
  SanJoaquin: [-70.61564953541995, -33.498485323162896],
  LoContador: [-70.61785030163261, -33.41986777583937],
};

export function getCampusEntryPoint(campus: string | null): [number, number] | null {
  if (!campus) return null;
  return campusEntryPoints[campus] ?? null;
}
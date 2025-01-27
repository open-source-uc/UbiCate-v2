import type { LngLatBoundsLike } from "mapbox-gl";

interface CampusBounds {
  longitudeRange: [number, number];
  latitudeRange: [number, number];
}

export const campusBounds: Record<string, CampusBounds> = {
  SanJoaquin: { longitudeRange: [-70.6171, -70.6043], latitudeRange: [-33.5021, -33.4952] },
  LoContador: { longitudeRange: [-70.6198, -70.6154], latitudeRange: [-33.4207, -33.4178] },
  Villarrica: { longitudeRange: [-72.2264, -72.2244], latitudeRange: [-39.2787, -39.2771] },
  CasaCentral: { longitudeRange: [-70.6424, -70.6386], latitudeRange: [-33.4427, -33.4403] },
  Oriente: { longitudeRange: [-70.597, -70.5902], latitudeRange: [-33.4477, -33.4435] },
  SJ: { longitudeRange: [-70.6171, -70.6043], latitudeRange: [-33.5021, -33.4952] },
  LC: { longitudeRange: [-70.6198, -70.6154], latitudeRange: [-33.4207, -33.4178] },
  VR: { longitudeRange: [-72.2264, -72.2244], latitudeRange: [-39.2787, -39.2771] },
  CC: { longitudeRange: [-70.6424, -70.6386], latitudeRange: [-33.4427, -33.4403] },
  OR: { longitudeRange: [-70.597, -70.5902], latitudeRange: [-33.4477, -33.4435] },
};

export const campusMaxBounds: Record<string, CampusBounds> = {
  SanJoaquin: {
    longitudeRange: [-70.62307240179186, -70.59884685362503],
    latitudeRange: [-33.509508238293144, -33.489337527669164]
  },
  LoContador: {
    longitudeRange: [-70.62567642511436, -70.60304813488096],
    latitudeRange: [-33.44558951180905, -33.38254425051799]
  },
  Villarrica: {
    longitudeRange: [-72.22652629578519, -72.22364220636078],
    latitudeRange: [-39.28767116764962, -39.262430534373074]
  },
  CasaCentral: {
    longitudeRange: [-70.64904059419399, -70.629035452913],
    latitudeRange: [-33.458783678625466, -33.41557666615463]
  },
  Oriente: {
    longitudeRange: [-70.60988774174442, -70.57682114489863],
    latitudeRange: [-33.461665186663446, -33.42454754613738]
  },
  SJ: {
    longitudeRange: [-70.62307240179186, -70.59884685362503],
    latitudeRange: [-33.509508238293144, -33.489337527669164]
  },
  LC: {
    longitudeRange: [-70.62567642511436, -70.60304813488096],
    latitudeRange: [-33.44558951180905, -33.38254425051799]
  },
  VR: {
    longitudeRange: [-72.22652629578519, -72.22364220636078],
    latitudeRange: [-39.28767116764962, -39.262430534373074]
  },
  CC: {
    longitudeRange: [-70.64904059419399, -70.629035452913],
    latitudeRange: [-33.458783678625466, -33.41557666615463]
  },
  OR: {
    longitudeRange: [-70.60988774174442, -70.57682114489863],
    latitudeRange: [-33.461665186663446, -33.42454754613738]
  },
};

export function stringToCampusSigle(e: string | null | undefined) {
  if (e === 'SanJoaquin') return 'SJ'
  if (e === 'LoContador') return 'LC'
  if (e === 'CasaCentral') return 'CC'
  if (e === 'Oriente') return 'OR'
  if (e === 'Villarrica') return 'VR'
  if (e === 'SJ') return 'SJ'
  if (e === 'LC') return 'LC'
  if (e === 'CC') return 'CC'
  if (e === 'OR') return 'OR'
  if (e === 'VR') return 'VR'
  return 'SJ'
}

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

export function getCampusFromPoint(longitude: number, latitude: number): string | null {
  for (const [boundaryCampus, boundary] of Object.entries(campusBounds)) {
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

export function getCampusFromPoint2(longitude: number, latitude: number): string {
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

  return "SanJoaquin"
}

export async function getCampusFromUserLocation(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          const campusBounds = getCampusFromPoint(longitude, latitude);

          if (campusBounds) {
            resolve(campusBounds);
          } else {
            resolve(null);
          }
        },
        (error) => {
          resolve(null);
        }
      );
    }
  });
}

import type { LngLatBoundsLike } from "mapbox-gl";
import { siglas as MapSiglas } from "@/utils/types";

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
};

export function getParamCampusBounds(paramCampus: string | null): LngLatBoundsLike {
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
export function getCampusBoundsFromPoint(longitude: number, latitude: number): LngLatBoundsLike | null {
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
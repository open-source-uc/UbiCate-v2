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

const campusMaxBounds: Record<string, CampusBounds> = {
  SanJoaquin: {
    longitudeRange: [-70.617503, -70.601962],
    latitudeRange: [-33.504828, -33.492834]
  },
  LoContador: {
    longitudeRange: [-70.619316, -70.612656],
    latitudeRange: [-33.424452, -33.410765]
  },
  Villarrica: {
    longitudeRange: [-72.225319, -72.225415],
    latitudeRange: [-39.280247, -39.275629]
  },
  CasaCentral: {
    longitudeRange: [-70.643948, -70.635644],
    latitudeRange: [-33.446233, -33.434954]
  },
  Oriente: {
    longitudeRange: [-70.597549, -70.589627],
    latitudeRange: [-33.447784, -33.443034]
  },
  SJ: {
    longitudeRange: [-70.617503, -70.635644],
    latitudeRange: [-33.504828, -33.492834]
  },
  LC: {
    longitudeRange: [-70.619316, -70.612656],
    latitudeRange: [-33.424452, -33.410765]
  },
  VR: {
    longitudeRange: [-72.225319, -72.225415],
    latitudeRange: [-39.280247, -39.275629]
  },
  CC: {
    longitudeRange: [-70.643948, -70.639467],
    latitudeRange: [-33.446233, -33.434954]
  },
  OR: {
    longitudeRange: [-70.597549, -70.589627],
    latitudeRange: [-33.447784, -33.443034]
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

function getCampusFromPoint(longitude: number, latitude: number): string | null {
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

async function getCampusFromUserLocation(): Promise<string | null> {
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

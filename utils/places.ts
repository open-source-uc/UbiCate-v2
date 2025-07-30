import rawPlaces from "@/data/places.json";

import { ALWAYS_VISIBLE_IDS } from "./constants";
import { JSONFeatures, Feature, PointFeature } from "./types";

const PlacesJSON: JSONFeatures = rawPlaces as JSONFeatures;

export const allPlaces: Feature[] = PlacesJSON.features;

export const alwaysVisiblePlaces: PointFeature[] = PlacesJSON.features.filter(
  (place: Feature): place is PointFeature =>
    place.geometry.type === "Point" && ALWAYS_VISIBLE_IDS.has(place.properties.identifier),
);

export default PlacesJSON;

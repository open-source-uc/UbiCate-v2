import rawEvents from "@/data/eventPlaces.json";
import { EventFeature, EventJSONFeatures } from "@/lib/types";

const EventsJSON: EventJSONFeatures = rawEvents as EventJSONFeatures;

export const allEvents: EventFeature[] = EventsJSON.features.filter(
  (f): f is EventFeature => "startDate" in f.properties,
);

export default EventsJSON;

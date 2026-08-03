import { EventProperties } from "@/lib/types";

export function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toUpperCase().replace(/\s+/g, "");
}

// Piso opcional que el evento definió para uno de sus lugares
export function getParentPlaceFloor(props: EventProperties, placeId: string): number | undefined {
  const floors = props.parentPlaceFloors;
  if (!floors || !placeId) return undefined;

  const normId = normalizeIdentifier(placeId);
  for (const [key, floor] of Object.entries(floors)) {
    if (normalizeIdentifier(key) === normId) return floor;
  }
  return undefined;
}

export function generateRandomIdWithTimestamp() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return timestamp + randomPart;
}

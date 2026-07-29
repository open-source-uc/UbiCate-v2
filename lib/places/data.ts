import { getAllPlaces, getPlaceById } from "@/lib/db/places";
import type { Feature } from "@/lib/types";

export async function getAllPlacesFromServer(): Promise<{ approved: Feature[]; newPlaces: Feature[] }> {
  return getAllPlaces();
}

export async function getPlaceByIdFromServer(id: string): Promise<Feature | null> {
  return getPlaceById(id);
}

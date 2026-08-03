import { Feature } from "@/lib/types";

interface PlaceSelectedDetail {
  feature: Feature;
}

export interface PlaceSelectedEvent extends CustomEvent<PlaceSelectedDetail> {
  type: "placeSelected";
  detail: PlaceSelectedDetail;
}

export const emitPlaceSelectedEvent = (feature: Feature): void => {
  const event = new CustomEvent("placeSelected", {
    detail: { feature },
    bubbles: true,
    cancelable: false,
  }) as PlaceSelectedEvent;

  document.dispatchEvent(event);
};

interface FlyToDetail {
  lng: number;
  lat: number;
  zoom?: number;
}

export interface FlyToEvent extends CustomEvent<FlyToDetail> {
  type: "mapFlyTo";
  detail: FlyToDetail;
}

// Centra el mapa en unas coordenadas sin seleccionar lugar ni tocar la URL (a diferencia de placeSelected).
export const emitFlyToEvent = (lng: number, lat: number, zoom?: number): void => {
  const event = new CustomEvent("mapFlyTo", {
    detail: { lng, lat, zoom },
    bubbles: true,
    cancelable: false,
  }) as FlyToEvent;

  document.dispatchEvent(event);
};

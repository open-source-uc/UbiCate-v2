import { Feature } from "@/utils/types";

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

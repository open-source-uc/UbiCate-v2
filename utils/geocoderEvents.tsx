import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

export function attachGeocoderListener(geocoder: MapboxGeocoder, event: string, handler: (results: any) => void) {
  geocoder.on(event, handler);

  return () => {
    geocoder.off(event, handler);
  };
}

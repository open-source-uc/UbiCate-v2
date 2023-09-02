import { Dispatch } from "react";

export default function getGeolocation(setLatitude: Dispatch<number>, setLongitude: Dispatch<number>): void {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      (error) => {
        console.error("Error al obtener la ubicación:", error);
      },
    );
  } else {
    console.error("Geolocalización no disponible en este navegador.");
  }
}

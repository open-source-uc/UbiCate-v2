import { centroid } from "@turf/centroid";

import { getCampusBoundsFromPoint, getCampusNameFromPoint } from "@/utils/getCampusBounds";
import { Feature } from "@/utils/types";

import * as Icons from "../components/icons/icons";
import { useDirections } from "../context/directionsCtx";
import { useSidebar } from "../context/sidebarCtx";
import { fetchDirection } from "../directions/fetchDirection";
import { useUbication } from "../hooks/useUbication";

interface RouteButtonProps {
  place: Feature | null;
}
function convertSecondsToReadableFormat(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes} minuto${minutes > 1 ? "s" : ""} y ${remainingSeconds} segundo${
      remainingSeconds !== 1 ? "s" : ""
    }`;
  } else {
    return `${remainingSeconds} segundo${remainingSeconds !== 1 ? "s" : ""}`;
  }
}

export default function RouteButton({ place }: RouteButtonProps) {
  const { setDirectionData, setTrackingUserLocation } = useDirections();
  const { position, alpha, cardinal } = useUbication();
  const { setSelectedPlace } = useSidebar();

  const handleDirections = async () => {
    if (!navigator.geolocation || !position) {
      alert("No podemos acceder a tu ubicación");
      return;
    }

    if (!place) {
      alert("No se puede calcular la ruta para este lugar");
      return;
    }

    if (!["SJ", "LC", "SanJoaquin", "LoContador"].includes(place.properties.campus)) {
      alert("No se puede calcular la ruta en este campus");
      return;
    }

    let destination: [number, number];

    if (place.geometry.type === "Point") {
      destination = place.geometry.coordinates as [number, number];
    } else if (place.geometry.type === "Polygon") {
      destination = centroid(place.geometry).geometry.coordinates as [number, number];
    } else {
      alert("No se puede calcular la ruta para este lugar");
      return;
    }

    if (getCampusBoundsFromPoint(position.geometry.coordinates[0], position.geometry.coordinates[1]) === null) {
      alert("No se puede calcular la ruta si estas afuera del campus xd. Deja de buscar bugs");
      return;
    }
    if (getCampusBoundsFromPoint(destination[0], destination[1]) === null) {
      alert("El punto de destino no está dentro de algun campus, esto es muy raro, por favor reporta este bug");
      return;
    }

    if (
      getCampusNameFromPoint(destination[0], destination[1]) !==
      getCampusNameFromPoint(position.geometry.coordinates[0], position.geometry.coordinates[1])
    ) {
      alert("No se puede calcular la ruta entre compus distintos");
      return;
    }

    try {
      const { direction, duration, distance } = await fetchDirection(position.geometry.coordinates, destination);

      if (!direction || !duration || !distance) {
        alert("No logró obtener la ruta");
        return;
      }

      // Convierte la duración
      const durationFormatted = convertSecondsToReadableFormat(duration);

      setTrackingUserLocation(true);
      setDirectionData(direction, durationFormatted, distance);
      setSelectedPlace(null);
    } catch (error) {
      console.log("Error fetching directions:", error);
      alert("No se logró obtener la ruta");
    }
  };

  return (
    <button
      onClick={handleDirections}
      onKeyDown={(e) => e.key === "Enter" && handleDirections()}
      aria-label="Cómo llegar a esta ubicación"
      role="button"
      tabIndex={0}
      className={`p-1 w-full cursor-pointer ${
        !navigator.geolocation ? "bg-gray-400" : "bg-blue-location hover:bg-brown-light"
      } text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2`}
    >
      <div className="flex justify-center items-center w-full h-10">
        <Icons.Directions />
      </div>
      <p className="text-xs font-medium">Cómo llegar</p>
    </button>
  );
}

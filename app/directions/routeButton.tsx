import { Feature } from "@/utils/types";

import * as Icons from "../components/icons/icons";
import { useDirections } from "../context/directionsCtx";
import { fetchDirection } from "../directions/fetchDirection";

interface RouteButtonProps {
  place: Feature | null;
}

export default function RouteButton({ place }: RouteButtonProps) {
  const { setDirectionData, setTrackingUserLocation } = useDirections();
  var userLocation: [number, number] = [-1, -1];

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        userLocation = [longitude, latitude];
      },
      (error) => {
        if (error.code === 1) {
          alert("Geolocation permission denied. Please enable location permissions in your browser settings.");
        }
      },
    );
  }

  const handleDirections = async () => {
    if (!navigator.geolocation || userLocation[0] === -1 || userLocation[1] === -1) {
      alert("No podemos acceder a tu ubicación");
      return;
    }

    if (!place) {
      alert("No se puede calcular la ruta para este lugar");
      return;
    }

    if (!["SJ", "LC"].includes(place.properties.campus)) {
      alert("No se puede calcular la ruta en este campus");
      return;
    }

    let destination: [number, number];

    if (place.geometry.type === "Point") {
      destination = place.geometry.coordinates as [number, number];
    } else if (place.geometry.type === "Polygon") {
      const coordinates = place.geometry.coordinates[0];
      const centroid = coordinates
        .reduce((acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]], [0, 0])
        .map((val) => val / coordinates.length) as [number, number];
      destination = centroid;
    } else {
      alert("No se puede calcular la ruta para este lugar");
      return;
    }

    try {
      const { direction, duration, distance } = await fetchDirection(userLocation, destination);

      if (!direction || !duration || !distance) {
        alert("No logró obtener la ruta");
        return;
      }

      setTrackingUserLocation(true);
      setDirectionData(direction, duration, distance);
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

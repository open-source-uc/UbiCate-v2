import { useEffect, useState, useCallback } from "react";

import type { MapRef } from "react-map-gl";

import { Feature, PointFeature } from "@/utils/types";

import * as Icons from "../components/icons/icons";
import LocationButton from "../components/locationButton";

import Marker from "./marker";

export default function ButtonMaps({ mapRef }: { mapRef: React.RefObject<MapRef | null> }) {
  const [userPosition, setUserPosition] = useState<Feature | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isFirstLocationFetch, setIsFirstLocationFetch] = useState(true);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por este navegador.");
      setIsTracking(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const newPosition: PointFeature = {
          type: "Feature",
          properties: {
            identifier: "user_location_0001",
            name: "Mi Ubicación",
            information: "",
            categories: ["userLocation"],
            campus: "SJ",
            faculties: "",
            floors: [1],
            needApproval: false,
          },
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        };

        setUserPosition(newPosition);

        // If it's the first location fetch, automatically center the map
        if (isFirstLocationFetch) {
          mapRef.current?.getMap().flyTo({
            center: newPosition.geometry.coordinates as [number, number],
            zoom: 17,
            duration: 400,
          });
          setIsFirstLocationFetch(false);
        }
      },
      (positionError) => {
        if (positionError.code === 1) {
          alert(
            "Permiso de ubicación denegado. Por favor, habilite los permisos de ubicación en la configuración de su navegador.",
          );
        }

        setIsTracking(false);
        setIsFirstLocationFetch(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }, [isFirstLocationFetch, mapRef]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isTracking) {
      // Initial location fetch
      getUserLocation();

      // Periodic location updates
      intervalId = setInterval(getUserLocation, 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, getUserLocation]);

  const handleLocationButtonClick = () => {
    if (userPosition === null) {
      // If no position, start tracking
      setIsTracking(true);
      return;
    }

    // Fly to user's location
    mapRef.current?.getMap().flyTo({
      center: userPosition.geometry.coordinates as [number, number],
      zoom: 17,
      duration: 400,
    });
  };

  return (
    <>
      {userPosition ? (
        <Marker
          key={userPosition.properties.identifier}
          place={userPosition as PointFeature}
          onClick={() => null}
          icon={<Icons.UserLocation />}
        />
      ) : null}

      <div className="fixed z-40 bottom-17 desktop:bottom-0 right-0 p-2">
        <LocationButton onClick={handleLocationButtonClick} />
      </div>
    </>
  );
}

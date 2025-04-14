import { useEffect, useState, useCallback } from "react";

import { useMap } from "react-map-gl";

import { Feature, PointFeature } from "@/utils/types";

import * as Icons from "../components/icons/icons";
import LocationButton from "../components/locationButton";
import { useDirections } from "../context/directionsCtx";

import Marker from "./marker";

export default function UserLocation() {
  const [userPosition, setUserPosition] = useState<Feature | null>(null);

  const { setTrackingUserLocation, isTrackingUserLocation } = useDirections();

  const [isFirstLocationFetch, setIsFirstLocationFetch] = useState(true);

  const { mainMap } = useMap();

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por este navegador.");
      setTrackingUserLocation(false);
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
          mainMap?.getMap().flyTo({
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

        setTrackingUserLocation(false);
        setIsFirstLocationFetch(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }, [isFirstLocationFetch, mainMap, setTrackingUserLocation]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isTrackingUserLocation) {
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
  }, [isTrackingUserLocation, getUserLocation]);

  const [alpha, setAlpha] = useState(0);
  const [bearing, setBearing] = useState(0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const updateBearing = () => {
      if (!mainMap) return;
      setBearing(mainMap.getBearing() || 0);
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha == null) return;
      setAlpha(event.alpha);
    };

    if (mainMap) {
      mainMap.on("move", updateBearing);
      updateBearing();
    }

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      if (mainMap) {
        mainMap.off("move", updateBearing);
      }
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [mainMap]);

  useEffect(() => {
    setRotation((alpha - bearing + 360) % 360);
  }, [alpha, bearing]);

  const handleLocationButtonClick = () => {
    if (userPosition === null) {
      setTrackingUserLocation(true);
      return;
    }

    mainMap?.getMap().flyTo({
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
          offset={[0, 0]}
          icon={<Icons.UserLocation rotation={rotation} className="h-4 w-4" />}
        />
      ) : null}
      <div className="fixed z-40 bottom-17 desktop:bottom-0 right-0 p-2">
        <LocationButton onClick={handleLocationButtonClick} />
      </div>
    </>
  );
}

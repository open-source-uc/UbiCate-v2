"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Places from "@/lib/places/data";
import { CATEGORIES, Feature, PointFeature } from "@/lib/types";

import * as Icon from "../components/ui/icons/icons";

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
}

function getNearestDea(latitude: number, longitude: number): PointFeature | null {
  const deaPoints = Places.features.filter((feature: Feature): feature is PointFeature => {
    return feature.geometry.type === "Point" && feature.properties.categories.includes(CATEGORIES.DEA);
  });

  if (!deaPoints.length) return null;

  let nearest = deaPoints[0];
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const point of deaPoints) {
    const [lng, lat] = point.geometry.coordinates;
    const distance = haversineDistanceMeters(latitude, longitude, lat, lng);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = point;
    }
  }

  return nearest;
}

export default function FindNearestDeaButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const goToDeaFilter = () => {
    router.push("/?category=dea");
  };

  const handleClick = () => {
    if (!navigator.geolocation) {
      goToDeaFilter();
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearestDea = getNearestDea(position.coords.latitude, position.coords.longitude);
        setIsLoading(false);

        if (!nearestDea) {
          goToDeaFilter();
          return;
        }

        router.push(`/?place=${encodeURIComponent(nearestDea.properties.identifier)}`);
      },
      () => {
        setIsLoading(false);
        goToDeaFilter();
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      },
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="w-full inline-flex items-stretch rounded-lg overflow-hidden bg-chart-dea text-background shadow-lg transition-opacity duration-200 hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <span className="w-14 shrink-0 inline-flex items-center justify-center bg-black/15 border-r border-background/30">
        <Icon.DEA className="w-6 h-6 text-background" />
      </span>
      <span className="flex-1 px-5 py-3 text-base md:text-lg font-semibold text-center">
        {isLoading ? "Buscando DEA..." : "Buscar DEA más cercano"}
      </span>
      <span aria-hidden="true" className="hidden md:inline-block w-14 shrink-0" />
    </button>
  );
}

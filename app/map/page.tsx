import { Metadata } from "next";

import { getParamCampusBounds } from "@/utils/getParamCampusBounds";
import { Feature } from "@/utils/types";

import PlacesJSON from "../../data/places.json";

import MapComponent from "./map";

type SearchParams = { campus?: string; place?: string; n?: string };

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const placeName: string | undefined = searchParams?.n;

  const params = new URLSearchParams();
  if (placeName) params.append("n", placeName);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000";
  return {
    title: placeName ? `UbíCate UC - ${placeName}` : "UbíCate UC - Mapa",
    openGraph: {
      images: [
        {
          url: `${baseUrl}/api/og-image?n=${placeName}`,
          width: 1200,
          height: 630,
          type: "image/png",
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/map${params.toString() ? `?${params.toString()}` : ""}`,
    },
  };
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const campusBounds = getParamCampusBounds(searchParams.campus ?? null);
  const paramPlaceId: string | undefined = searchParams?.place;
  const paramPlace: Feature | null =
    (PlacesJSON.features.find((place) => place.properties.identifier === paramPlaceId) as Feature) ?? null;

  return (
    <>
      <main spellCheck="false" className="h-full w-full relative">
        <MapComponent Places={PlacesJSON} paramCampusBounds={campusBounds} paramPlace={paramPlace} />
      </main>
    </>
  );
}

export const runtime = "edge";

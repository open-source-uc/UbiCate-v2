import { Metadata } from "next";

import { getParamCampusBounds } from "@/utils/getCampusBounds";
import { Feature, JSONFeatures } from "@/utils/types";

import PlacesJSON from "../../data/places.json";

import MapComponent from "./map";

type SearchParams = { campus?: string; place?: string; lng?: number; lat?: number };

export async function generateMetadata(props: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000";
  const paramPlaceId: string | undefined = searchParams?.place;
  const paramPlace: Feature | null =
    (PlacesJSON.features.find((place) => place.properties.identifier === paramPlaceId) as Feature) ?? null;
  const placeName = paramPlace?.properties?.name || "";

  return {
    title: placeName ? `UbíCate UC - ${placeName}` : "UbíCate UC - Mapa",
    openGraph: {
      images: [
        {
          url: new URL(`${baseUrl}/api/og-image?n=${placeName}`),
          width: 1200,
          height: 630,
          type: "image/png",
        },
      ],
    },
  };
}

export default async function Page(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const campusBounds = getParamCampusBounds(searchParams.campus ?? null);
  const paramPlaceId: string | undefined = searchParams?.place;
  const paramLng: number | undefined = searchParams?.lng;
  const paramLat: number | undefined = searchParams?.lat;

  const paramPlace: Feature | null =
    (PlacesJSON.features.find((place) => place.properties.identifier === paramPlaceId) as Feature) ?? null;

  return (
    <>
      <main spellCheck="false" className="h-full w-full relative">
        <Suspense>
          <MapComponent
            Places={PlacesJSON as JSONFeatures}
            paramCampusBounds={campusBounds}
            paramPlace={paramPlace}
            paramLat={paramLat}
            paramLng={paramLng}
          />
        </Suspense>
      </main>
    </>
  );
}

export const runtime = "edge";

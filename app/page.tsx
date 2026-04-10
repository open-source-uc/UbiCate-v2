import { Metadata } from "next";

import PlacesJSON from "@/lib/places/data";
import { Feature } from "@/lib/types";

import NavigationSidebar from "./components/features/navigation/sidebar/NavigationSidebar";
import MapPage from "./map/mapPage";
import Providers from "./providers";
import StructuredData from "./components/app/StructuredData";
import H1SEO from "./components/app/H1SEO";
type SearchParams = { campus?: string; place?: string; lng?: number; lat?: number };

export async function generateMetadata(props: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const paramPlaceId: string | undefined = searchParams?.place;
  const paramPlace: Feature | null = paramPlaceId
    ? PlacesJSON.features.find((place) => place.properties.identifier === paramPlaceId) ?? null
    : null;

  const defaultDescription =
    "Mapa interactivo para encontrar salas, baños, bibliotecas y casinos en los campus de la Pontificia Universidad Católica. Navega fácil y rápido.";

  let title = "Ubicate UC: Mapa interactivo de salas, baños y bibliotecas en campus UC";
  let floor = undefined;
  if (paramPlace) {
    floor = paramPlace?.properties.floors?.[0];
    title = `${paramPlace.properties.name} en ${paramPlace.properties.campus} | Ubicate UC`;
  }

  let placeDescription = "";
  if (paramPlace) {
    const infoText = paramPlace.properties.information && paramPlace.properties.information.trim() !== "" 
      ? ` · ${paramPlace.properties.information}` 
      : "";
    placeDescription = `Ubicación: ${paramPlace.properties.name} en ${paramPlace.properties.campus}.${infoText}`.substring(0, 160);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const indexPage = process.env.INDEX_PAGE === "TRUE";

  return {
    title: title,
    description: paramPlace ? placeDescription : defaultDescription,
    alternates: {
      canonical: `${baseUrl}/`,
    },
    authors: [{ name: "Open Source eUC" }],
    twitter: {
      card: "summary_large_image",
    },
    openGraph: {
      images: [
        {
          url: new URL(`${baseUrl}/api/og-image?n=${paramPlace?.properties.name || ""}`),
        },
      ],
    },
    metadataBase: new URL(baseUrl),
    keywords: [
      "Ubicate",
      "Ubicate UC",
      "Mapa UC",
      "Mapa interactivo",
      "Salas UC",
      "Campus UC",
      "Salas clases UC",
      "Baños UC",
      "Bibliotecas UC",
      "Casinos UC",
      "San Joaquín",
      "Casa Central",
      "Lo Contador",
      "Oriente",
      "Villarrica",
      "Pontificia Universidad Católica",
      "PUC",
      "Mapa campus",
      "Ubicación salas",
      "Cómo llegar UC",
      "Navegación campus",
      "Open Source",
    ],
    robots: indexPage ? "index, follow" : "noindex, nofollow",
  };
}

export default async function Page(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const paramLng: number | undefined = searchParams?.lng;
  const paramLat: number | undefined = searchParams?.lat;

  const paramPlace: Feature | null = searchParams?.place
    ? (PlacesJSON.features.find(
        (place) => place.properties.identifier.toUpperCase() === searchParams?.place?.toUpperCase(),
      ) as Feature) ?? null
    : null;

  return (
    <>
      <StructuredData />
      <H1SEO />
      <main spellCheck="false" className="h-full w-full relative flex">
        <Providers>
          <NavigationSidebar />
          <MapPage paramPlace={paramPlace} paramLat={paramLat} paramLng={paramLng} />
        </Providers>
      </main>
    </>
  );
}

export const runtime = "edge";

import { Metadata } from "next";

import { getPlaceById } from "@/lib/db/places";
import type { Feature } from "@/lib/types";

import H1SEO from "./components/app/H1SEO";
import StructuredData from "./components/app/StructuredData";
import NavigationSidebar from "./components/features/navigation/sidebar/NavigationSidebar";
import MapPage from "./map/mapPage";
import Providers from "./providers";

type SearchParams = { campus?: string; place?: string; lng?: number; lat?: number };

export async function generateMetadata(props: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const paramPlaceId: string | undefined = searchParams?.place;
  const paramPlace: Feature | null = paramPlaceId ? await getPlaceById(paramPlaceId) : null;

  const defaultDescription =
    "Mapa interactivo para encontrar salas, baños, bibliotecas y casinos en los campus de la Pontificia Universidad Católica. Navega fácil y rápido.";

  let title = "Ubicate UC: Mapa interactivo de salas, baños y bibliotecas en campus UC";
  if (paramPlace) {
    title = `${paramPlace.properties.name} en ${paramPlace.properties.campus} | Ubicate UC`;
  }

  let placeDescription = "";
  if (paramPlace) {
    const infoText =
      paramPlace.properties.information && paramPlace.properties.information.trim() !== ""
        ? ` · ${paramPlace.properties.information}`
        : "";
    placeDescription =
      `Ubicación: ${paramPlace.properties.name} en ${paramPlace.properties.campus}.${infoText}`.substring(0, 160);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const indexPage = process.env.INDEX_PAGE === "TRUE";

  return {
    title: title,
    description: paramPlace ? placeDescription : defaultDescription,
    alternates: {
      canonical: paramPlace ? `${baseUrl}/?place=${paramPlaceId}` : `${baseUrl}/`,
    },
    authors: [{ name: "Open Source eUC" }],
    twitter: {
      card: "summary_large_image",
    },
    openGraph: {
      title: title,
      description: paramPlace ? placeDescription : defaultDescription,
      type: "website",
      locale: "es_CL",
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
    robots: !indexPage
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
  };
}

export default async function Page(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const paramLng: number | undefined = searchParams?.lng;
  const paramLat: number | undefined = searchParams?.lat;

  const paramPlace: Feature | null = searchParams?.place ? await getPlaceById(searchParams.place) : null;

  return (
    <>
      <StructuredData />
      <H1SEO />
      <main spellCheck="false" className="h-full w-full relative">
        <Providers>
          <NavigationSidebar />
          <MapPage paramPlace={paramPlace} paramLat={paramLat} paramLng={paramLng} />
        </Providers>
      </main>
    </>
  );
}

import { Metadata } from "next";

import PlacesJSON from "@/lib/places/data";
import { Feature } from "@/lib/types";

import NavigationSidebar from "./components/features/navigation/sidebar/NavigationSidebar";
import MapPage from "./map/mapPage";
import Providers from "./providers";
type SearchParams = { campus?: string; place?: string; lng?: number; lat?: number };

export async function generateMetadata(props: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const paramPlaceId: string | undefined = searchParams?.place;
  const paramPlace: Feature | null = paramPlaceId
    ? PlacesJSON.features.find((place) => place.properties.identifier === paramPlaceId) ?? null
    : null;

  const defaultDescription =
    "Encuentra fácilmente salas de clases, baños, bibliotecas y puntos de comida en los campus de la " +
    "Pontificia Universidad Católica de Chile. Nuestra herramienta interactiva te ayuda a navegar de " +
    "manera rápida y eficiente, optimizando tu tiempo y mejorando tu experiencia en la universidad. " +
    "¡Explora y descubre todo lo que necesitas al alcance de tu mano! Busca Salas UC";

  let title = "Ubicate · Tu mapa en la UC";
  let floor = undefined;
  if (paramPlace) {
    title =
      `Ubicate · ${paramPlace.properties.name}` +
      (floor ? ` · Piso ${floor}` : "") +
      ` · Campus ${paramPlace.properties.campus}`;
    floor = paramPlace?.properties.floors?.[0];
  }

  let placeDescription = "";
  if (paramPlace) {
    placeDescription = (floor ? `Piso: ${floor}` : "") + ` · Campus: ${paramPlace.properties.campus}`;

    if (paramPlace.properties.information && paramPlace.properties.information.trim() !== "") {
      placeDescription += ` · Información: ${paramPlace.properties.information}`;
    }
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
      "Salas UC",
      "Campus UC",
      "Pontificia Universidad Católica de Chile",
      "Mapa UC",
      "Ubicate UC",
      "San Joaquín",
      "Open Source",
      "Busca Salas UC",
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

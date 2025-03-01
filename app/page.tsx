import { Metadata } from "next";

import PlacesJSON from "@/utils/places";
import { Feature } from "@/utils/types";

import NavigationBar from "./components/NavigationBar";
import { SidebarProvider } from "./context/sidebarCtx";
import MapComponent from "./map/map";

type SearchParams = { campus?: string; place?: string; lng?: number; lat?: number };

export async function generateMetadata(props: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const paramPlaceId: string | undefined = searchParams?.place;
  const paramPlace: Feature | null =
    (PlacesJSON.features.find((place) => place.properties.identifier === paramPlaceId) as Feature) ?? null;
  const placeName = paramPlace?.properties?.name || "";

  return {
    title: placeName ? `Ubicate · ${placeName}` : "Ubicate · Tu mapa en la UC",
    description:
      "Encuentra fácilmente salas de clases, baños, bibliotecas y puntos de comida en los campus de la Pontificia Universidad Católica de Chile. Nuestra herramienta interactiva te ayuda a navegar de manera rápida y eficiente, optimizando tu tiempo y mejorando tu experiencia en la universidad. ¡Explora y descubre todo lo que necesitas al alcance de tu mano! Busca Salas UC",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    },
    authors: [{ name: "Open Source UC" }],
    twitter: {
      card: "summary_large_image",
    },
    openGraph: {
      images: [
        {
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/opengraph-image.png`),
        },
      ],
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
    keywords: [
      "Salas UC",
      "Campus UC",
      "Pontificia Universidad Católica de Chile",
      "Mapa UC",
      "Ubícate UC",
      "San Joaquín",
      "Open Source",
      "Busca Salas UC",
    ],
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
      <SidebarProvider>
        <main spellCheck="false" className="h-full w-full relative">
          <NavigationBar />
          <MapComponent paramPlace={paramPlace} paramLat={paramLat} paramLng={paramLng} />
        </main>
      </SidebarProvider>
    </>
  );
}

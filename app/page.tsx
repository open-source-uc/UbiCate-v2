import Image from "next/image";
import Link from "next/link";

import { Metadata } from "next";

import LandingSearch from "./components/landingSearch";
import NavegateToCampus from "./components/navegateToCampus";
import TypeAnimationWrapper from "./components/typeAnimationWrapper";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Ubicate · Tu mapa en la UC",
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
    ],
  };
}

export default function Home() {
  return (
    <main className="flex max-h-screen flex-col items-center justify-between py-10 px-3">
      <div className="relative flex place-items-center">
        <Image className="" src="/logo.svg" alt="UbíCate uc" width={180} height={37} priority />
      </div>
      <TypeAnimationWrapper />
      <section className="justify-center w-full align-middle items-center">
        {/* En el siguiente componente se ingresa la busqueda*/}
        <LandingSearch />
        {/* En el siguiente componente se maneja la logica de auto navete al campus la primera vez que se entra */}
        <NavegateToCampus />
      </section>
    </main>
  );
}

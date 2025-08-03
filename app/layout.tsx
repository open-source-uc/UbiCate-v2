import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { cookies } from "next/headers";

import { Metadata } from "next";

import ManifestFixer from "./components/ManifestFixer";
import SWRegister from "./components/SWRegister";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/"),
  title: "Ubicate UC",
  description:
    "Encuentra fácilmente salas de clases, baños, bibliotecas y puntos de comida en los campus de la Pontificia Universidad Católica (PUC). Nuestra herramienta interactiva te ayuda a navegar de manera rápida y eficiente, optimizando tu tiempo y mejorando tu experiencia en la universidad. ¡Explora y descubre todo lo que necesitas al alcance de tu mano! Busca Salas UC. Mapa Campus San Joaquín y más.",
  icons: {
    apple: "/icons/icon-192x192.png",
  },
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "Open Source eUC" }],
  twitter: {
    card: "summary_large_image",
  },
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("ubicate-theme")?.value;

  return (
    <html lang="es" {...(themeCookie ? { "data-theme": themeCookie } : {})}>
      <body className="h-full">
        <SWRegister />
        <ManifestFixer />
        <div className="w-full h-dvh flex flex-col justify-between">{children}</div>
      </body>
    </html>
  );
}

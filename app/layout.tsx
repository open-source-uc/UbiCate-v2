import { Instrument_Sans } from "next/font/google";

import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

import { Suspense } from "react";

import { Metadata } from "next";
import type { Viewport } from "next";

import NavigationBar from "./components/NavigationBar";
import { SidebarProvider } from "./context/sidebarCtx";

const instrument_sans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  title: "UbíCate UC",

  description:
    "Encuentra fácilmente salas de clases, baños, bibliotecas y puntos de comida en los campus de la Pontificia Universidad Católica (PUC). Nuestra herramienta interactiva te ayuda a navegar de manera rápida y eficiente, optimizando tu tiempo y mejorando tu experiencia en la universidad. ¡Explora y descubre todo lo que necesitas al alcance de tu mano! Busca Salas UC",

  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
  },

  authors: [{ name: "Open Source UC" }],

  twitter: {
    card: "summary_large_image",
  },

  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://localhost"),

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

export const viewport: Viewport = {
  themeColor: [{ color: "#0284c7" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${instrument_sans.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="h-full pb-[-12px] dark:bg-dark-1">
        {/*No sacar el Suspense, pues si se saca fallara el build pues al ser el sidebarprovider un componente de cliente y layout uno de server, nextjs no sabra que hacer y dara error */}
        <div className="w-full h-dvh flex-col justify-between dark:bg-dark-1">
          <SidebarProvider>
            <Suspense>
              <NavigationBar></NavigationBar>
            </Suspense>
            {children}
          </SidebarProvider>
        </div>
      </body>
    </html>
  );
}

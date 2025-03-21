import { Instrument_Sans } from "next/font/google";

import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

import { Metadata } from "next";
import type { Viewport } from "next";

const instrument_sans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  title: "Ubicate UC",

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
  themeColor: [{ color: "#150a04" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${instrument_sans.variable}`}>
      <body className="h-full pb-[-12px] dark:bg-dark-1">
        <div className="w-full h-dvh flex-col justify-between dark:bg-dark-1">{children}</div>
      </body>
    </html>
  );
}

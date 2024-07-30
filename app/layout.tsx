import { Inter } from "next/font/google";
import Link from "next/link";

import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Metadata } from "next";

import DarkModeSelector from "./components/darkModeSelector";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UbiCate UC",
  description: "Explora y encuentra fácilmente salas, baños y puntos de interés en los distintos campus de la UC",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
  },
  authors: [{ name: "Open Source UC" }],
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    title: "UbiCate UC",
    description: "Explora y encuentra fácilmente salas, baños y puntos de interés en los distintos campus de la UC",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || ""),
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`h-full pb-[-12px] dark:bg-dark-1 ${inter.className}`}>
        <main className="w-full h-dvh flex-col justify-between pb-12 dark:bg-dark-1">
          <nav className="w-full select-none text-white h-12 flex items-center justify-between px-4 bg-dark-4">
            <div className="text-xl font-bold font-heading">
              <Link href="/">Ubicate UC</Link>
            </div>
            <ul className="flex space-x-8 font-semibold font-heading">
              <li>
                <DarkModeSelector />
              </li>
              <li>
                <Link href="/map">Mapa</Link>
              </li>
              <li>
                <Link href="/form-geo">➕ Agrega nueva ubicación </Link>
              </li>
            </ul>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}

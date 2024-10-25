import { Inter } from "next/font/google";

import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Metadata } from "next";

import Header from "./components/header";
import Overlay from "./components/overlay";
import Sidebar from "./components/sidebar";
import { SidebarProvider } from "./context/sidebarCtx";

const inter = Inter({ subsets: ["latin"] });

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`h-full pb-[-12px] dark:bg-dark-1 ${inter.className}`}>
        <SidebarProvider>
          <Overlay />
          <div className="w-full h-dvh flex-col justify-between pb-12 dark:bg-dark-1">
            <Header />
            <Sidebar />
            {children}
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { Roboto } from "next/font/google";
// import { cookies } from "next/headers";
import Script from "next/script";

import { Metadata } from "next";

// import AnnouncementHandler from "./components/app/AnnouncementHandler";
import ConnectionBadge from "./components/app/ConnectionBadge";
import ManifestFixer from "./components/app/ManifestFixer";
import SWRegister from "./components/app/SWRegister";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/"),
  title: "Ubicate UC: Mapa interactivo de salas, baños y bibliotecas en campus UC",
  description:
    "Mapa interactivo para encontrar salas, baños, bibliotecas y casinos en los campus de la Pontificia Universidad Católica. Navega fácil y rápido.",
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
    "Ubicate",
    "UC",
    "ubicate",
    "uc",
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
};

const roboto = Roboto({
  subsets: ["latin"],
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Persistencia deshabilitada - siempre usar tema por defecto de UC
  // const cookieStore = await cookies();
  // const themeCookie = cookieStore.get("ubicate-theme")?.value;

  return (
    <html lang="es" data-theme="uc-theme">
      <head>
        {/* Google Tag Manager UC - DTFD */}
        <Script id="gtm-script" strategy="beforeInteractive">
          {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-TD5BXRC');
          `}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body className="h-full">
        {/* Popup de encuesta deshabilitado temporalmente */}
        {/* <AnnouncementHandler /> */}
        {/* Google Tag Manager (noscript) - DTFD / UC*/}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TD5BXRC"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) - DTFD / UC */}
        <div className="w-full h-dvh flex flex-col justify-between">{children}</div>
        <ConnectionBadge />
        <SWRegister />
        <ManifestFixer />
      </body>
    </html>
  );
}

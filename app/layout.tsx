import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { cookies } from "next/headers";
import Script from "next/script";

import { Metadata } from "next";

import ManifestFixer from "./components/app/ManifestFixer";
import SWRegister from "./components/app/SWRegister";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/"),
  title: "Ubicate UC",
  description:
    "Encuentra fácilmente salas de clases, baños, bibliotecas y puntos de comida en los campus de la Pontificia Universidad Católica (PUC). Nuestra herramienta interactiva te ayuda a navegar de manera rápida y eficiente, optimizando tu tiempo y mejorando tu experiencia en la universidad. ¡Explora y descubre todo lo que necesitas al alcance de tu mano! Busca Salas UC",
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
        <SWRegister />
        <ManifestFixer />
      </body>
    </html>
  );
}

import { Inter } from "next/font/google";
import Head from "next/head";
import Link from "next/link";

import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import DarkModeSelector from "./components/DarkModeSelector";
import { SearchResultProvider } from "./context/SearchResultCtx";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "UbiCate UC",
  description:
    "Buscador de salas y otro lugares de interés en campus de la Pontificia Universidad Católica de Chile, con mapa dinámico.",
  author: "Open Source UC",
  twitter: {
    card: "summary_large_image",
  },
  keywords:
    "Pontificia Universidad Católica de Chile, salas, campus, mapa, uc, ubicación, estudiantes, Open Source, san Joaquin, casa central, lo contador",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="author" content={metadata.author} />
        <meta name="keywords" content={metadata.keywords} />
      </Head>
      <body className={`h-full m-[-12px] dark:bg-dark-1 ${inter.className}`}>
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
          <SearchResultProvider>{children}</SearchResultProvider>
        </main>
      </body>
    </html>
  );
}

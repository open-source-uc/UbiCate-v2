import { Inter } from "next/font/google";
import Link from "next/link";
import Head from "next/head";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ubicate UC",
  description: "Buscador de salas en campus de la Pontificia Universidad Católica de Chile, con mapa dinámico. Proyecto Open Source.",
  author: "OSUC",
  keywords: "Pontificia Universidad Católica de Chile, salas, campus, mapa, uc, ubicación, estudiantes, Open Source, san Joaquin, casa central, lo contador",
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
      <body className={inter.className}>
        <main className="flex w-screen h-screen flex-col justify-between ">
        <nav className="w-screen text-black bg-blue-200 h-10 flex flex-row">
            <Link href="" className="my-1 mx-2">
              Home
            </Link>
            <Link href="/map" className="my-1 mx-2">
              Map
            </Link>
            <Link href="/form-geo" className="my-1 mx-2">
              Form
            </Link>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}

import Head from "next/head";
import Link from "next/link";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

export const metadata = {
  title: "Ubicate UC",
  description:
    "Buscador de salas en campus de la Pontificia Universidad Católica de Chile, con mapa dinámico. Proyecto Open Source.",
  author: "OSUC",
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
      <body className="h-full pb-[-12px] bg-dark-1">
        <main className="w-full h-screen flex-col justify-between pb-12 bg-dark-1">
          <nav className="w-full text-white h-12 flex items-center justify-between px-4 bg-dark-4">
            <div className="text-xl font-bold font-heading">
              <Link href="/">Ubicate UC</Link>
            </div>
            <ul className="flex space-x-8 font-semibold font-heading">
              <li>
                <Link href="/map">Map</Link>
              </li>
              <li>
                <Link href="/form-geo">Form</Link>
              </li>
            </ul>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}

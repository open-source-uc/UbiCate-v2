import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-black-ubi p-4">
      <section className="w-full max-w-xs sm:max-w-md lg:max-w-lg text-center p-6 sm:p-8 border-2 border-brown-light rounded-2xl shadow-lg shadow-red-ubi">
        <h1 className="text-3xl sm:text-4xl font-bold text-red-ubi mb-4">Página no encontrada</h1>
        <p className="text-base sm:text-lg text-gray-300 mb-6">Parece que te perdiste en el camino...</p>
        <Link
          href="/"
          className="inline-block w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-semibold text-black-ubi bg-primary rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Regresar al inicio
        </Link>
      </section>
    </main>
  );
}

export const runtime = "edge";

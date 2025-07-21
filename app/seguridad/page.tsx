import Link from "next/link";

export default function Page() {
  return (
    <main spellCheck="false" className="min-h-screen w-full pb-7 flex items-center justify-center">
      <div className="w-full text-center px-4 max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-6 text-white-ubi hover:text-primary transition-colors duration-200 underline"
        >
          ← Volver a inicio
        </Link>

        <h1 className="text-xl font-bold mb-8 text-white-ubi">
          En caso de emergencia en el campus, comuníquese al siguiente número:
        </h1>

        <div className="bg-secondary rounded-lg p-8">
          <a
            href="tel:+56 9 5504 5000"
            className="text-5xl font-bold text-primary transition-colors duration-200 block underline"
          >
            +56 9 5504 5000
          </a>
        </div>
      </div>
    </main>
  );
}

export const runtime = "edge";

import Link from "next/link";

export default function Page() {
  return (
    <main spellCheck="false" className="w-full pb-7">
      <div className="min-h-screen w-full flex items-center justify-center">
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
      </div>
      <div className="min-h-screen w-full flex items-center justify-center px-4">
        <div className="bg-red-600 rounded-lg p-8 border-2 border-red-700 text-white max-w-5xl w-full">
          <h3>
            <strong>En caso de emergencia comunícate a este número:</strong>
          </h3>
          <ul className="list-disc list-inside mt-4 text-center">
            <li>Teléfonos Fijos UC: Anexo 5000</li>
            <li>
              Celulares:{" "}
              <Link className="text-yellow-300 underline font-bold" href="tel:+56955045000">
                +56 955045000
              </Link>
            </li>
          </ul>
          <p className="mt-4">Espera la llegada del personal calificado y sigue sus instrucciones.</p>
          <p className="mt-4">
            <strong>
              En caso de vivir una situación que atenta contra la seguridad de una persona en un campus o sus
              inmediaciones:
            </strong>
          </p>
          <p className="mt-2">
            Debes comunicarte al{" "}
            <Link className="text-yellow-300 underline font-bold" href="tel:+56955045000">
              +56 955045000
            </Link>{" "}
            si eres víctima o testigo de:
          </p>
          <ul className="list-disc list-inside mt-4">
            <li>Hurto</li>
            <li>Robo al interior del campus</li>
            <li>Delito en las inmediaciones del campus</li>
            <li>Delito de connotación sexual</li>
            <li>Riñas al interior del campus</li>
            <li>Manifestaciones al exterior del campus</li>
            <li>Emergencia exterior que cause cierre del campus</li>
          </ul>
          <p className="mt-4">
            Si quieres conocer en específico todos los procedimientos de seguridad puedes revisar el{" "}
            <Link
              href="https://uccl0.sharepoint.com/sites/uc365_Gestion_de_documentos-Emergencias/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2Fuc365%5FGestion%5Fde%5Fdocumentos%2DEmergencias%2FShared%20Documents%2FManuales%20y%20procedimientos%2FInstructivo%20de%20seguridad%20para%20la%20comunidad%20UC%2Epdf&parent=%2Fsites%2Fuc365%5FGestion%5Fde%5Fdocumentos%2DEmergencias%2FShared%20Documents%2FManuales%20y%20procedimientos&p=true&ga=1"
              className="text-yellow-300 underline font-bold"
            >
              Instructivo de seguridad para la Comunidad UC.
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export const runtime = "edge";

import { Metadata } from "next";

import FormComponent from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const title = "UbiCate UC - Agregar nueva ubicación";
  const description = "Ayúdanos registrando una nueva sala o cualquier otra ubicación.";

  return {
    title: title,
    description: description,

    openGraph: {
      title: title,
      description: description,
    },

    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    },
  };
}

export default async function Page() {
  return (
    <>
      <main spellCheck="false" className="h-full w-full">
        <FormComponent />
      </main>
    </>
  );
}

export const runtime = "edge";

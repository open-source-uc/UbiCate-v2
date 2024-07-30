import { Metadata } from "next";

import FormComponent from "./form";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "UbiCate UC - Agregar nueva ubicación",
    description: "Ayúdanos registrando una nueva sala o cualquier otra ubicación.",
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

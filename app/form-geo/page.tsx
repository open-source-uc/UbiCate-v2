import { Metadata } from "next";

import { METHOD } from "@/utils/types";

import FormComponent from "./form";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "UbíCate UC - Agregar nueva ubicación",
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
        <div className="w-full text-center my-6">
          <h1 className="text-3xl lg:text-6xl text-black dark:text-white select-none">Nueva ubicación</h1>
          <h2 className="text-base lg:text-lg text-black dark:text-light-4 select-none text-center">
            Ayúdanos registrando una nueva sala, oficina o cualquier otro espacio que consideres pertinente.
          </h2>
        </div>
        <FormComponent values={null} mode={METHOD.CREATE} fun={null} />
      </main>
    </>
  );
}

export const config = {
  runtime: "edge",
};

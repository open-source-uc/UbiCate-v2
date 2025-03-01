import { Metadata } from "next";

import { METHOD } from "@/utils/types";

import FormComponent from "./form";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Ubicate UC - Nueva ubicación",
    description: "Ayúdanos registrando una nueva ubicación.",

    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    },
  };
}

export default async function Page() {
  return (
    <>
      <main spellCheck="false" className="h-full w-full">
        <div className="w-full text-center p-12">
          <h1 className="text-2xl font-semibold text-white-ubi">Nueva ubicación (Beta)</h1>
          <h2 className="text-lg text-white-ubi">
            ¡Ayúdanos registrando una nueva ubicación! <br />
          </h2>
        </div>
        <FormComponent values={null} mode={METHOD.CREATE} fun={null} />
      </main>
    </>
  );
}

export const runtime = "edge";

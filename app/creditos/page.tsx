import Link from "next/link";

import Contribuir from "@/app/creditos/contributor";
import contributorsData from "@/data/contributors.json";

type Contributor = {
  name: string;
  career: string;
};

const contributors: Contributor[] = contributorsData;

export default function Page() {
  return (
    <main
      spellCheck="false"
      className="h-screen w-full overflow-y-auto py-16 px-4 tablet:px-16 desktop:px-48 bg-primary"
    >
      <section className="mx-auto px-4 pt-16 space-y-6">
        <h1 className="text-4xl text-background">
          <span className="font-medium">Ubicate:</span> <span className="font-light">Un proyecto de colaboración</span>
        </h1>
        <p className="text-lg font-light leading-relaxed text-muted">
          Ubicate es un proyecto de{" "}
          <Link href="https://osuc.dev" className="underline">
            Open Source eUC
          </Link>{" "}
          que, desde 2015, busca facilitar la navegación de la comunidad universitaria en los campus. Desde 2025,
          Ubicate se ha consolidado como una herramienta oficial de nuestra universidad gracias a los esfuerzos de la{" "}
          <Link
            href="https://www.uc.cl/universidad/vicerrectorias/vicerrectoria-de-inteligencia-digital/"
            className="underline"
          >
            Vicerrectoría de Inteligencia Digital
          </Link>
          .
        </p>

        <p className="text-lg font-light leading-relaxed text-muted">
          A lo largo de los años, muchas personas han aportado su tiempo y esfuerzo para mejorar y expandir Ubicate. En
          esta página, queremos reconocer y agradecer a todas las contribuidoras y contribuyentes que han hecho posible
          este proyecto.
        </p>

        <p className="text-lg font-light leading-relaxed text-muted">
          Tu mismo puedes ser parte de este proyecto. Puedes contribuir de muchas formas, ya sea reportando errores,
          sugiriendo mejoras, o incluso colaborando directamente en el desarrollo del código. Si estás interesado en
          ayudar, no dudes en ponerte en contacto con nosotros a través de nuestro{" "}
          <Link href="https://github.com/open-source-uc/UbiCate-v2" className="underline">
            repositorio de GitHub
          </Link>
          .
        </p>
      </section>

      <section className="pt-8 max-w-6xl mx-auto px-4 space-y-8">
        <div className="space-y-3 text-left">
          <h2 className="text-2xl font-regular text-background">Contribuidores de UbiCate</h2>
          <p className="text-lg font-light text-muted">
            Ubicate no sería posible sin la dedicación y el esfuerzo de los contribuidores de{" "}
            <Link href="https://www.openstreetmap.org/" className="underline">
              Open Street Map
            </Link>
            ,{" "}
            <Link href="https://maplibre.org/" className="underline">
              MapLibre
            </Link>{" "}
            y los muchos estudiantes que han colaborado a lo largo de los años. A continuación se muestra una lista de
            quienes han aportado al proyecto.
          </p>
        </div>

        {contributors.length > 0 ? (
          <ul className="list-none grid gap-6 p-0 grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4">
            {contributors.map((contributor) => (
              <Contribuir key={contributor.name} name={contributor.name} career={contributor.career} />
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-md font-light text-muted">
            Aún no hay contribuidoras o contribuyentes listados. Actualiza este espacio con los nombres de quienes han
            aportado.
          </p>
        )}
      </section>
    </main>
  );
}

export const runtime = "edge";

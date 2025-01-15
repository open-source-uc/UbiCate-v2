import Image from "next/image";

export default async function Page() {
  return (
    <main className="w-full text-balance px-2 | bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <section className="w-full text-center">
        <div className="py-4">
          <Image
            src="/logo-osuc.svg"
            alt="Open Source UC Logo"
            width={192}
            height={192}
            className="mx-auto drop-shadow-lg"
          />
        </div>

        <p className="text-xl max-w-2xl mx-auto leading-relaxed">
          Este proyecto es mantenido por{" "}
          <a
            href="https://osuc.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-600 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-500 transition-all underline"
          >
            Open Source UC
          </a>
        </p>
        <p className="text-lg max-w-2xl mx-auto leading-relaxed pt-4">
          Estamos abiertos a tus sugerencias, ideas y ayuda. Puedes contribuir reportando problemas, proponiendo nuevas
          características o uniéndote a nuestro equipo.
        </p>

        <h2 className="text-3xl font-bold pt-10">¿Cómo puedes contribuir?</h2>

        <div className="pt-6 flex flex-col items-center space-y-4">
          <a
            href="https://github.com/open-source-uc/UbiCate-v2/issues/new?labels=bug&template=bug_report.md&title=%5BBUG%5D%3A+"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-64 h-16 bg-sky-600 text-white text-lg font-semibold rounded-lg hover:bg-sky-700 transition-all shadow-lg"
          >
            🐛 Reportar un Bug
          </a>
          <a
            href="https://github.com/open-source-uc/UbiCate-v2/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=%5BFEAT%5D%3A+"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-64 h-16 bg-sky-600 text-white text-lg font-semibold rounded-lg hover:bg-sky-700 transition-all shadow-lg"
          >
            🌟 Proponer una Característica
          </a>
        </div>
      </section>
      <section className="py-10 text-center w-full">
        <h2 className="text-3xl font-bold pb-4">Código Abierto para Todos</h2>
        <div className="flex justify-center items-center flex-col">
          <p className="text-lg leading-relaxed max-w-3xl ">
            Todo el código de esta página es de código abierto y puedes utilizarlo como base para cualquier proyecto.
          </p>
          <a
            href="https://github.com/open-source-uc/UbiCate-v2"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-600 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-500 transition-all underline text-2xl"
          >
            📂 Ver el Repositorio
          </a>
        </div>
      </section>
    </main>
  );
}

export const config = {
  runtime: "edge",
};

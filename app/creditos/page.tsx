import Image from "next/image";

import Contribuir from "@/app/creditos/contributor";

async function fetchContributors() {
  try {
    const response = await fetch("https://api.github.com/repos/open-source-uc/UbiCate-v2/contributors");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return [];
  }
}

export default async function Page() {
  const contributors: any = await fetchContributors();

  return (
    <main spellCheck="false" className="min-h-screen w-full pb-7">
      <div className="w-full text-center px-4">
        <div className="w-full text-center px-4">
          <div className="py-8">
            <Image
              src="/logo-osuc.svg"
              alt="Open Source UC Logo"
              width={192}
              height={192}
              className="mx-auto drop-shadow-lg"
            />
          </div>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed">
            Desarrollado por{" "}
            <a
              href="https://osuc.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold transition-all underline text-chart-3"
            >
              Open Source UC
            </a>
            , una comunidad dedicada a generar soluciones innovadoras que benefician a toda la universidad.
          </p>
          <br />
          <p className="text-lg max-w-2xl mx-auto leading-relaxed">
            El código de este proyecto es{" "}
            <a
              href="https://github.com/open-source-uc/UbiCate-v2"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold transition-all underline text-chart-3"
            >
              código abierto
            </a>
            , por lo que cualquier persona puede aportar.
          </p>
        </div>

        <h2 className="text-3xl font-bold mt-10 text-white-ubi">Contribuidores de UbiCate</h2>

        <div className="mt-8">
          {contributors.length > 0 ? (
            <ul className="list-none p-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {contributors
                .filter((contributor: any) => !contributor.login.toLowerCase().includes("bot"))
                .map((contributor: any) => (
                  <Contribuir
                    key={contributor.id}
                    login={contributor.login}
                    avatar_url={contributor.avatar_url}
                    html_url={contributor.html_url}
                  />
                ))}
            </ul>
          ) : (
            <p className="text-lg font-medium text-white-ubi">Cargando contribuyentes...</p>
          )}
        </div>
      </div>
    </main>
  );
}

export const runtime = "edge";

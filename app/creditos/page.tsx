import Image from "next/image";
import Link from "next/link";

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
  const contributors = await fetchContributors();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
            <Image src="/logo-osuc.svg" alt="Open Source UC Logo" width={120} height={120} className="mx-auto" />
          </Link>

          <h1 className="text-3xl font-bold mb-8 text-foreground">Créditos</h1>

          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl p-6 mb-8">
            <div className="space-y-4 text-foreground/90">
              <p className="text-lg leading-relaxed">
                Desarrollado por{" "}
                <a
                  href="https://osuc.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline transition-all"
                >
                  Open Source UC
                </a>
                , una comunidad dedicada a generar soluciones innovadoras que benefician a toda la universidad.
              </p>

              <p className="text-lg leading-relaxed">
                El código de este proyecto es{" "}
                <a
                  href="https://github.com/open-source-uc/UbiCate-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline transition-all"
                >
                  código abierto
                </a>
                , por lo que cualquier persona puede aportar.
              </p>
            </div>
          </div>
        </div>

        {/* Contributors Section */}
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-foreground text-center">Contribuidores</h2>

          <div className="min-h-[200px] flex items-center justify-center">
            {contributors.length > 0 ? (
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full">
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
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-muted-foreground">Cargando contribuidores...</p>
              </div>
            )}
          </div>
        </div>

        {/* Back to Map Link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Volver al mapa
          </Link>
        </div>
      </div>
    </main>
  );
}

export const runtime = "edge";

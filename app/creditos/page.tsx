import Image from "next/image";

import EnhancedContributor from "@/app/creditos/enhanced-contributor";
import contributorsData from "@/data/contributors.json";
import { ContributorsData } from "@/lib/types/contributors";

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
  const githubContributors: any = await fetchContributors();
  const contributors: ContributorsData = contributorsData as ContributorsData;

  return (
    <main spellCheck="false" className="min-h-screen w-full pb-12 bg-gradient-to-b from-background to-background/95">
      <div className="w-full text-center px-4 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="py-12">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-osuc.svg"
              alt="Open Source eUC Logo"
              width={192}
              height={192}
              className="mx-auto drop-shadow-2xl"
            />
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            <p className="text-xl leading-relaxed">
              Desarrollado por{" "}
              <a
                href="https://osuc.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold transition-all underline text-primary hover:text-primary/80"
              >
                Open Source eUC
              </a>
              , una comunidad dedicada a generar soluciones innovadoras que benefician a toda la universidad.
            </p>

            <p className="text-lg leading-relaxed text-muted-foreground">
              El código de este proyecto es{" "}
              <a
                href="https://github.com/open-source-uc/UbiCate-v2"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold transition-all underline text-primary hover:text-primary/80"
              >
                código abierto
              </a>
              , por lo que cualquier persona puede aportar.
            </p>
          </div>
        </div>

        {/* Open Source eUC Contributors Section */}
        <section className="mb-16">
          <div className="flex items-center justify-center mb-8 space-x-4">
            <Image src="/logo-osuc.svg" alt="Open Source eUC" width={48} height={48} className="drop-shadow-lg" />
            <h2 className="text-4xl font-bold text-primary">Equipo Open Source eUC</h2>
          </div>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Los desarrolladores principales y mantenedores del proyecto
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contributors.osuc_contributors.map((contributor) => (
              <EnhancedContributor
                key={contributor.id}
                firstName={contributor.firstName}
                lastName={contributor.lastName}
                githubUsername={contributor.githubUsername}
                githubUrl={contributor.githubUrl}
                linkedinUrl={contributor.linkedinUrl}
                avatarUrl={contributor.avatarUrl}
                role={contributor.role}
                variant="osuc"
              />
            ))}
          </div>
        </section>

        {/* UC Contributors Section */}
        <section className="mb-16">
          <div className="flex items-center justify-center mb-8 space-x-4">
            <Image src="/logo.svg" alt="UC Logo" width={48} height={48} className="drop-shadow-lg" />
            <h2 className="text-4xl font-bold text-tertiary-foreground">Desarrolladores UC</h2>
          </div>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Estudiantes y desarrolladores de la Pontificia Universidad Católica de Chile
          </p>

          {contributors.uc_contributors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contributors.uc_contributors.map((contributor) => (
                <EnhancedContributor
                  key={contributor.id}
                  firstName={contributor.firstName}
                  lastName={contributor.lastName}
                  githubUsername={contributor.githubUsername}
                  githubUrl={contributor.githubUrl}
                  linkedinUrl={contributor.linkedinUrl}
                  avatarUrl={contributor.avatarUrl}
                  role={contributor.role}
                  variant="uc"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">¡Sé el primer estudiante UC en contribuir!</p>
              <a
                href="https://github.com/open-source-uc/UbiCate-v2/blob/main/contributing.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-tertiary-foreground bg-tertiary rounded-lg hover:bg-tertiary/90 transition-colors"
              >
                Ver guía de contribución
              </a>
            </div>
          )}
        </section>

        {/* Community Contributors */}
        <section>
          <h3 className="text-2xl font-bold mb-6 text-foreground">Todos los Contribuidores de la Comunidad</h3>

          <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
            Estos son todos los colaboradores que han contribuido al repositorio según GitHub
          </p>

          <div className="bg-secondary/30 rounded-xl p-8 backdrop-blur-sm border border-border/20">
            {githubContributors.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {githubContributors
                  .filter((contributor: any) => !contributor.login.toLowerCase().includes("bot"))
                  .map((contributor: any) => (
                    <a
                      key={contributor.id}
                      href={contributor.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-3 rounded-lg hover:bg-background/50 transition-colors group"
                      title={`@${contributor.login}`}
                    >
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.login}
                        className="w-12 h-12 rounded-full mb-2 border-2 border-muted/30 group-hover:border-primary transition-colors"
                      />
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate w-full text-center">
                        @{contributor.login}
                      </span>
                    </a>
                  ))}
              </div>
            ) : (
              <p className="text-lg font-medium text-muted-foreground">Cargando contribuyentes...</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export const runtime = "edge";

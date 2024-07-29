export async function GET() {
  return new Response(
    `
      <!DOCTYPE html>
      <html>
        <head>
          <title>UbiCate UC
          </title>
          <meta name="description" content="Buscador de salas ylugares de interés en campus de la Pontificia Universidad Católica de Chile." />
          <meta name="author" content="Open Source UC" />
          <meta name="keywords" content="Pontificia Universidad Católica de Chile, salas, campus, mapa, uc, ubicación, estudiantes, Open Source, san Joaquin, casa central, lo contador" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:title" content="UbiCate UC" />
          <meta property="og:description" content="Buscador de salas ylugares de interés en campus de la Pontificia Universidad Católica de Chile." />
          <meta property="og:image" content="" />
          <meta property="og:image:width" content="1200" />
        `,
  );
}

export const runtime = "edge";

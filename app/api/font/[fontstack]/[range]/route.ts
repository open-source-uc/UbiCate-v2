import { NextRequest, NextResponse } from "next/server";

import { getAllowedOrigin } from "@/lib/config/allowOrigins";
import { getBasemapObject, type BasemapObject } from "@/lib/map/basemapStore";

// Ambos entran en la key de almacenamiento y, en self-host, esa key es una ruta del filesystem: sin
// esto un range con ../ se sale del directorio de glyphs.
const RANGE_PATTERN = /^\d+-\d+$/;
const FONT_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;

async function findAvailableFont(fontstack: string, range: string): Promise<BasemapObject | null> {
  const fonts = fontstack.split(",").map((f) => f.trim());

  for (const requestedFont of fonts) {
    const decodedFont = decodeURIComponent(requestedFont).replaceAll(" ", "");
    if (!FONT_NAME_PATTERN.test(decodedFont)) continue;

    const object = await getBasemapObject(`glyphs/${decodedFont}/${range}.pbf`);
    // continue, no return: el resto del fontstack es justamente el fallback.
    if (object) return object;
  }
  console.warn("No available fonts found for fontstack:", fontstack);

  return null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ fontstack: string; range: string }> }) {
  try {
    const { fontstack, range } = await params;

    if (!RANGE_PATTERN.test(range)) {
      return NextResponse.json({ error: `Invalid glyph range: ${range}` }, { status: 400 });
    }

    let object;
    try {
      object = await findAvailableFont(fontstack, range);
    } catch (storageError) {
      console.error("Basemap storage access error:", storageError);
      return NextResponse.json({ error: "Storage access failed" }, { status: 503 });
    }

    if (!object) {
      return NextResponse.json(
        {
          error: `No glyphs found for fontstack: ${fontstack}, range: ${range}`,
        },
        { status: 404 },
      );
    }

    const origin = request.headers.get("origin");
    const allowedOrigin = getAllowedOrigin(origin);

    const headers = new Headers({
      "Content-Type": "application/x-protobuf",
      "Content-Encoding": "identity",
      "Content-Length": object.size.toString(),
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
      // El .pbf de un par (fuente, rango) es función del archivo de fuente que se generó: no cambia
      // nunca, así que se puede marcar inmutable. Sin esto el navegador revalidaba cada 30 minutos.
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: object.etag,
      Vary: "Accept-Encoding",
    });

    if (allowedOrigin) {
      headers.set("Access-Control-Allow-Origin", allowedOrigin);
    }

    return new NextResponse(object.body, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigin = getAllowedOrigin(origin);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    "Access-Control-Max-Age": "86400", // Cache preflight por 24 horas
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return new NextResponse(null, {
    status: 200,
    headers,
  });
}

export const runtime = "nodejs";

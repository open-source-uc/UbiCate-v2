import { NextRequest, NextResponse } from "next/server";

import { getAllowedOrigin } from "@/lib/config/allowOrigins";
import { getBasemapObject } from "@/lib/map/basemapStore";

export async function GET(request: NextRequest, { params }: { params: Promise<{ x: string; y: string; z: string }> }) {
  try {
    const { x, y, z } = await params;

    const xNum = parseInt(x, 10);
    const yNum = parseInt(y, 10);
    const zNum = parseInt(z, 10);

    if (isNaN(xNum) || isNaN(yNum) || isNaN(zNum)) {
      return NextResponse.json({ error: "Invalid tile coordinates: must be integers" }, { status: 400 });
    }

    const tileKey = `ubicate-tiles/${zNum}/${xNum}/${yNum}.pbf`;

    let object;
    try {
      object = await getBasemapObject(tileKey);
    } catch (storageError) {
      console.error("Basemap storage access error:", storageError);
      return NextResponse.json({ error: "Storage access failed" }, { status: 503 });
    }

    if (!object) {
      return NextResponse.json({ error: `Tile not found: ${zNum}/${xNum}/${yNum}.pbf` }, { status: 404 });
    }

    // Verificar y establecer CORS dinámicamente
    const origin = request.headers.get("origin");
    const allowedOrigin = getAllowedOrigin(origin);

    const headers = new Headers({
      "Content-Type": "application/x-protobuf",
      "Content-Encoding": "identity",
      "Content-Length": object.size.toString(),
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
      // El basemap se regenera a mano con self-host-map/upload-local.bash, o sea casi nunca; 30 días
      // alinea con el TTL del cache "map-tiles" del service worker.
      "Cache-Control": "public, max-age=2592000, s-maxage=2592000",
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
    console.error("Error processing tile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Manejar preflight requests (OPTIONS)
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

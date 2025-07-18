import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

// app/api/[z]/[x]/[y]/route.ts
export async function GET(request: NextRequest, { params }: { params: Promise<{ x: string; y: string; z: string }> }) {
  try {
    const { x, y, z } = await params;

    const xNum = parseInt(x, 10);
    const yNum = parseInt(y, 10);
    const zNum = parseInt(z, 10);

    if (isNaN(xNum) || isNaN(yNum) || isNaN(zNum)) {
      return NextResponse.json({ error: "Invalid tile coordinates: must be integers" }, { status: 400 });
    }

    const R2 = getRequestContext().env.R2;
    const tileKey = `ubicate-tiles/${zNum}/${xNum}/${yNum}.pbf`;

    let object;
    try {
      object = await R2.get(tileKey);
    } catch (r2Error) {
      console.error("R2 access error:", r2Error);
      return NextResponse.json({ error: "Storage access failed" }, { status: 503 });
    }

    if (!object) {
      return NextResponse.json({ error: `Tile not found: ${zNum}/${xNum}/${yNum}.pbf` }, { status: 404 });
    }

    // Obtener los datos como stream
    const data = object.body;

    if (!data) {
      return NextResponse.json({ error: "Empty tile data" }, { status: 500 });
    }

    const headers = new Headers({
      "Content-Type": "application/x-protobuf",
      "Content-Encoding": "identity",
      "Content-Length": object.size.toString(),
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
      "Cache-Control": "public, max-age=1800, s-maxage=3600",
      Expires: new Date(Date.now() + 30 * 60 * 1000).toUTCString(),
      ETag: object.httpEtag,
      Vary: "Accept-Encoding",
    });

    return new NextResponse(data, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Error processing tile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

import { getRequestContext } from "@cloudflare/next-on-pages";

import { getAllowedOrigin } from "@/lib/config/allowOrigins";

// app/api/[z]/[x]/[y]/route.ts
export async function GET(request: NextRequest, { params }: { params: Promise<{ fontstack: string; range: string }> }) {
  try {
    const { fontstack, range } = await params;

    const R2 = getRequestContext().env.R2;
    const tileKey = `glyphs/${fontstack}/${range}.pbf`;

    let object;
    try {
      object = await R2.get(tileKey);
    } catch (r2Error) {
      console.error("R2 access error:", r2Error);
      return NextResponse.json({ error: "Storage access failed" }, { status: 503 });
    }

    if (!object) {
      return NextResponse.json({ error: `Glyphs not found for fontstack: ${fontstack}, range: ${range}` }, { status: 404 });
    }
    // Obtener los datos como stream
    const data = object.body;

    if (!data) {
      return NextResponse.json({ error: "Empty tile data" }, { status: 500 });
    }

    const origin = request.headers.get("origin");
    const allowedOrigin = getAllowedOrigin(origin);

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

    if (allowedOrigin) {
      headers.set("Access-Control-Allow-Origin", allowedOrigin);
    }

    return new NextResponse(data, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Error processing tile:", error);
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

export const runtime = "edge";

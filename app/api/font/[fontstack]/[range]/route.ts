import { NextRequest, NextResponse } from "next/server";

import { getRequestContext } from "@cloudflare/next-on-pages";

import { getAllowedOrigin } from "@/lib/config/allowOrigins";

// Default fallback font if requested font is not available
const DEFAULT_FONT = "Roboto%20Slab%20Regular";

async function findAvailableFont(
  R2: R2Bucket,
  fontstack: string,
  range: string,
): Promise<{ font: string; key: string; object: R2ObjectBody } | null> {
  // Split fontstack and try each font in order
  const fonts = fontstack.split(",").map((f) => f.trim());

  console.log(`Font request - Fontstack: ${fontstack}, Range: ${range}`);
  console.log(`Trying fonts in order: ${fonts.join(", ")}`);

  for (const requestedFont of fonts) {
    // Decode URI component to handle URL-encoded font names
    const decodedFont = decodeURIComponent(requestedFont);
    // Re-encode for use as R2 key
    const encodedFont = encodeURIComponent(decodedFont);
    const tileKey = `glyphs/${encodedFont}/${range}.pbf`;

    console.log(`Trying font: ${requestedFont} -> ${decodedFont} -> ${encodedFont} (${tileKey})`);

    try {
      console.log(`Checking R2 for key: ${tileKey}`);
      const object = await R2.get(tileKey);
      if (object) {
        return { font: encodedFont, key: tileKey, object };
      } else {
        console.log(`✗ Font not found: ${tileKey}`);
        return null;
      }
    } catch (error) {
      console.log(`✗ Error accessing ${tileKey}:`, error);
      return null;
    }
  }

  return null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ fontstack: string; range: string }> }) {
  try {
    const { fontstack, range } = await params;

    const R2 = getRequestContext().env.R2;

    const result = await findAvailableFont(R2, fontstack, range);

    if (!result) {
      return NextResponse.json(
        {
          error: `No glyphs found for fontstack: ${fontstack}, range: ${range}`,
          defaultFont: DEFAULT_FONT,
        },
        { status: 404 },
      );
    }

    const { object } = result;
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
    console.error("Error processing font request:", error);
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

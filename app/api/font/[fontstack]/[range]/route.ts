import { NextRequest, NextResponse } from "next/server";

import { getRequestContext } from "@cloudflare/next-on-pages";

import { getAllowedOrigin } from "@/lib/config/allowOrigins";

// Font mapping configuration - maps requested fonts to available R2 folder names
const FONT_MAPPING: Record<string, string> = {
  // Roboto Slab variants - map to available R2 folders (URL encoded)
  "Roboto Slab Regular": "Roboto%20Slab%20Regular",
  "Roboto Slab SemiBold": "Roboto%20Slab%20SemiBold", 
  "Roboto Slab Medium": "Roboto%20Slab%20Medium",
  "Roboto Slab Bold": "Roboto%20Slab%20Regular",  // Fallback to Regular if Bold not available
  
  // Open Sans variants - fallback to Roboto if not available
  "Open Sans Regular": "Roboto%20Slab%20Regular",
  "Open Sans SemiBold": "Roboto%20Slab%20Regular",
  "Open Sans Medium": "Roboto%20Slab%20Regular",
  "Open Sans Bold": "Roboto%20Slab%20Regular",
  
  // Arial fallbacks - map to available fonts
  "Arial Unicode MS Regular": "Roboto%20Slab%20Regular",
  "Arial Unicode MS Bold": "Roboto%20Slab%20Regular",
  "Arial Unicode MS": "Roboto%20Slab%20Regular",
};

// Default fallback font if none of the mapping works
const DEFAULT_FONT = "Roboto%20Slab%20Regular";

async function findAvailableFont(R2: any, fontstack: string, range: string): Promise<{ font: string; key: string; object: any } | null> {
  // Split fontstack and try each font in order
  const fonts = fontstack.split(',').map(f => f.trim());
  
  console.log(`Font request - Fontstack: ${fontstack}, Range: ${range}`);
  console.log(`Trying fonts in order: ${fonts.join(', ')}`);
  
  for (const requestedFont of fonts) {
    // Try direct mapping first
    const mappedFont = FONT_MAPPING[requestedFont] || requestedFont;
    const tileKey = `glyphs/${mappedFont}/${range}.pbf`;
    
    console.log(`Trying font: ${requestedFont} -> ${mappedFont} (${tileKey})`);
    
    try {
      const object = await R2.get(tileKey);
      if (object) {
        console.log(`✓ Font found: ${tileKey}`);
        return { font: mappedFont, key: tileKey, object };
      }
    } catch (error) {
      console.log(`✗ Error accessing ${tileKey}:`, error);
    }
  }
  
  // Try default fallback
  const defaultKey = `glyphs/${DEFAULT_FONT}/${range}.pbf`;
  console.log(`Trying default fallback: ${defaultKey}`);
  
  try {
    const object = await R2.get(defaultKey);
    if (object) {
      console.log(`✓ Default font found: ${defaultKey}`);
      return { font: DEFAULT_FONT, key: defaultKey, object };
    }
  } catch (error) {
    console.log(`✗ Error accessing default font ${defaultKey}:`, error);
  }
  
  console.log(`✗ No fonts found for fontstack: ${fontstack}, range: ${range}`);
  return null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ fontstack: string; range: string }> }) {
  try {
    const { fontstack, range } = await params;
    
    const R2 = getRequestContext().env.R2;
    const result = await findAvailableFont(R2, fontstack, range);

    if (!result) {
      return NextResponse.json({ 
        error: `No glyphs found for fontstack: ${fontstack}, range: ${range}`,
        availableFonts: Object.keys(FONT_MAPPING),
        defaultFont: DEFAULT_FONT
      }, { status: 404 });
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

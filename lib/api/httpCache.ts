import { NextResponse } from "next/server";

const DATA_CACHE_CONTROL = "public, max-age=0, s-maxage=60, stale-while-revalidate=600";

export interface CachedPayload {
  body: string;
  etag: string;
}

export async function buildCachedPayload(value: unknown): Promise<CachedPayload> {
  const body = JSON.stringify(value);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
  const hex = Array.from(new Uint8Array(digest).subarray(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
  return { body, etag: `"${hex}"` };
}

export function cachedJsonResponse(request: Request, payload: CachedPayload, options?: { noStore?: boolean }) {
  const headers: Record<string, string> = {
    "Cache-Control": options?.noStore ? "no-store" : DATA_CACHE_CONTROL,
    ETag: payload.etag,
    Vary: "X-Ubicate-Fresh",
  };

  if (request.headers.get("if-none-match") === payload.etag) {
    return new NextResponse(null, { status: 304, headers });
  }

  return new NextResponse(payload.body, {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

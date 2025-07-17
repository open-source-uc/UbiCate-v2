import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import pako from "pako";

// app/api/[z]/[x]/[y]/route.ts
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ x: string, y: string, z: string }> }
) {
    try {
        // Await the params object before using its properties
        const { x, y, z } = await params;

        const xNum = parseInt(x, 10);
        const yNum = parseInt(y, 10);
        const zNum = parseInt(z, 10);

        // Enhanced validation
        if (isNaN(xNum) || isNaN(yNum) || isNaN(zNum)) {
            return NextResponse.json(
                { error: "Invalid tile coordinates: must be integers" },
                { status: 400 }
            );
        }

        // Optional: Add bounds checking for typical web map tiles
        if (zNum < 0 || zNum > 22 || xNum < 0 || yNum < 0) {
            return NextResponse.json(
                { error: "Tile coordinates out of bounds" },
                { status: 400 }
            );
        }

        // Check if x,y are within valid range for zoom level
        const maxTileIndex = Math.pow(2, zNum) - 1;
        if (xNum > maxTileIndex || yNum > maxTileIndex) {
            return NextResponse.json(
                { error: `Tile coordinates out of bounds for zoom level ${zNum}` },
                { status: 400 }
            );
        }

        const R2 = getRequestContext().env.R2;
        const tileKey = `ubicate-tiles/${zNum}/${xNum}/${yNum}.pbf`;

        let object;
        try {
            object = await R2.get(tileKey);
        } catch (r2Error) {
            console.error('R2 access error:', r2Error);
            return NextResponse.json(
                { error: "Storage access failed" },
                { status: 503 }
            );
        }

        if (!object) {
            return NextResponse.json(
                { error: `Tile not found: ${zNum}/${xNum}/${yNum}.pbf` },
                { status: 404 }
            );
        }

        // Obtener los datos como stream
        const compressedStream = object.body;

        if (!compressedStream) {
            return NextResponse.json(
                { error: "Empty tile data" },
                { status: 500 }
            );
        }

        let decompressedData: ArrayBuffer;
        try {
            // Convertir el stream a Uint8Array para usar con pako
            const compressedBuffer = await new Response(compressedStream).arrayBuffer();
            const compressedUint8Array = new Uint8Array(compressedBuffer);

            // Descomprimir usando pako (compatible con Edge Runtime)
            const decompressedUint8Array = pako.ungzip(compressedUint8Array);

            // Crear un nuevo ArrayBuffer para evitar problemas de tipo
            decompressedData = new ArrayBuffer(decompressedUint8Array.length);
            const view = new Uint8Array(decompressedData);
            view.set(decompressedUint8Array);

            // Verificar que los datos descomprimidos no estén vacíos
            if (decompressedData.byteLength === 0) {
                throw new Error('Decompressed data is empty');
            }
        } catch (decompressionError) {
            console.error('Decompression error:', decompressionError);
            return NextResponse.json(
                { error: "Failed to decompress tile data" },
                { status: 500 }
            );
        }

        // Configurar headers apropiados para Protocol Buffers

        const headers = new Headers({
            'Content-Type': 'application/x-protobuf',
            'Content-Encoding': 'identity', // Ya no está comprimido
            'Content-Length': decompressedData.byteLength.toString(),
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
            'Cache-Control': 'public, max-age=1800, s-maxage=3600', // Cache en cliente y CDN
            'Expires': new Date(Date.now() + 30 * 60 * 1000).toUTCString(),
            'ETag': object.httpEtag, // Simple ETag for caching
            'Vary': 'Accept-Encoding' // Important for caching
        });

        // Retornar los datos binarios descomprimidos
        return new NextResponse(decompressedData, {
            status: 200,
            headers: headers
        });

    } catch (error) {
        console.error('Error processing tile:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}


export const runtime = "edge";
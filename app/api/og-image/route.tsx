import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

import fs from "node:fs/promises";
import path from "node:path";

function Template({ text, image }: { text: string; image: string }) {
  return (
    <div tw="relative flex w-full h-full items-start justify-start">
      <div tw="absolute flex inset-0">
        <img src={image} alt="Ubicate" width={1200} height={630} />
      </div>

      <div tw="flex flex-col h-full pl-16 pt-16 pr-16">
        <div tw="flex text-white text-8xl font-black leading-tight max-w-full" style={{ wordWrap: "break-word" }}>
          {text}
        </div>
      </div>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const placeName: string = request.nextUrl.searchParams.get("n") ?? "";
  const imagePath = path.join(process.cwd(), "public", "opengraph-image.png");

  const imageBuffer = await fs.readFile(imagePath);
  const imageBase64 = `data:image/png;base64,${imageBuffer.toString("base64")}`;

  const text = placeName === "" ? "Find Everything in your Campus" : placeName;
  const textTruncated: string = text && text.length > 60 ? `${text.slice(0, 60)}...` : text;

  return new ImageResponse(<Template text={textTruncated} image={imageBase64} />, {
    width: 1200,
    height: 630,
    status: 200,
  });
}

export const runtime = "nodejs";

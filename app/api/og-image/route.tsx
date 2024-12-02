import { NextRequest, ImageResponse } from "next/server";

function Template({ text, url }: { text: string; url: string }) {
  return (
    <div tw="relative flex w-full h-full flex items-center justify-center">
      <div tw="absolute flex inset-0">
        <img src={url} alt="UbíCate UC - Mapa" width={1200} height={630} />
        <div tw="absolute flex inset-0 bg-black bg-opacity-0" />
      </div>
      <div tw="flex flex-col h-full flex-col-reverse">
        <div tw="flex h-1/3 items-center text-white text-8xl font-bold">{text}</div>
      </div>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const paramCampus: string | null = request.nextUrl.searchParams.get("campus");
  const paramPlaceId: string | null = request.nextUrl.searchParams.get("place");

  const url = new URL(request.nextUrl.href);
  const baseUrl = `${url.origin.toString()}`;

  const text = paramCampus || "Mapa";
  const textTruncated: string = text && text.length > 20 ? `${text.slice(0, 20)}...` : text;

  const fontResponse = await fetch(`${baseUrl}/fonts/Lato-Bold.ttf`);

  return new ImageResponse(<Template text={textTruncated} url={baseUrl + "/opengraph-image.png"} />, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "VictorMono",
        data: await fontResponse.arrayBuffer(),
        weight: 700,
        style: "normal",
      },
    ],
    status: 200,
  });
}

export const runtime = "edge";

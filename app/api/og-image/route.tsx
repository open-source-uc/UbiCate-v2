import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

function Template({ text, url }: { text: string; url: string }) {
  return (
    <div tw="relative flex w-full h-full flex items-start justify-start">
      <div tw="absolute flex inset-0">
        <img src={url} alt="Ubicate" width={1200} height={630} />
        <div tw="absolute flex inset-0 bg-black bg-opacity-0" />
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
  const url = new URL(request.nextUrl.href);
  const baseUrl = `${url.origin.toString()}`;

  const text = placeName === "" ? "Find Everything in your Campus" : placeName;
  const textTruncated: string = text && text.length > 24 ? `${text.slice(0, 24)}...` : text;

  return new ImageResponse(<Template text={textTruncated} url={baseUrl + "/opengraph-image.png"} />, {
    width: 1200,
    height: 630,
    status: 200,
  });
}

export const runtime = "edge";

import { ImageResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const paramCampus: string | null = request.nextUrl.searchParams.get("campus");
  const paramPlaceId: string | null = request.nextUrl.searchParams.get("place");

  const text = paramPlaceId ? paramPlaceId : paramCampus;
  const textTruncated: string | null = text && text.length > 20 ? `${text.slice(0, 20)}...` : text;

  return new ImageResponse(
    (
      <div tw="relative flex w-full h-full flex items-center justify-center">
        <div tw="absolute flex inset-0">
          <div tw="absolute flex inset-0 bg-black bg-opacity-0" />
        </div>
        <div tw="flex flex-col h-full flex-col-reverse">
          <div tw="flex h-1/3 items-center text-white text-8xl font-bold">{textTruncated}</div>
        </div>
      </div>
    ),
  );
}

export const runtime = "edge";

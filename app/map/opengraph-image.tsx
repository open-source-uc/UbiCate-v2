import { ImageResponse } from "next/og";

export const alt = "UbiCate UC - Mapa";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "url('../opengraph-image.png') no-repeat center center",
          backgroundSize: "cover",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        About Acme
      </div>
    ),
    {
      ...size,
    },
  );
}

export const runtime = "edge";

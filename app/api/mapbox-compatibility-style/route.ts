import { NextResponse } from "next/server";

const MAPBOX_USER = "ubicate";
const MAPBOX_STYLE_ID = "cm7nhvwia00av01sm66n40918";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function removePitch(obj: any): any {
  if (Array.isArray(obj)) {
    let arr = obj.filter((item) => !(Array.isArray(item) && item[0] === "pitch")).map(removePitch);

    if (arr[0] === "step") {
      if (typeof arr[1] === "boolean") {
        return null;
      }
      if (arr.length % 2 === 0) {
        arr = arr.slice(0, -1);
      }
    }
    return arr.filter((x) => x !== null);
  } else if (typeof obj === "object" && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      if (key === "filter") {
        const cleaned = removePitch(obj[key]);
        newObj[key] = Array.isArray(cleaned)
          ? cleaned.filter((item) => !(Array.isArray(item) && item[0] === "pitch"))
          : cleaned;
      } else if (key === "layout") {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          newObj[key] = {};
          for (const layoutKey in obj[key]) {
            if (!layoutKey.includes("pitch")) {
              newObj[key][layoutKey] = obj[key][layoutKey];
            }
          }
        } else {
          newObj[key] = obj[key];
        }
      } else {
        newObj[key] = removePitch(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

function removeNameProperties(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeNameProperties);
  } else if (typeof obj === "object" && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      if (key !== "name") {
        newObj[key] = removeNameProperties(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

export async function GET() {
  if (!MAPBOX_TOKEN) {
    return NextResponse.json({ error: "Mapbox token not set" }, { status: 500 });
  }
  const styleUrl = `https://api.mapbox.com/styles/v1/${MAPBOX_USER}/${MAPBOX_STYLE_ID}?access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(styleUrl);
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch style from Mapbox" }, { status: 500 });
  }
  const styleJson = await res.json();
  const cleaned = removePitch(styleJson);
  const cleanedNoName = removeNameProperties(cleaned);
  return NextResponse.json(cleanedNoName);
}

export const runtime = "edge";

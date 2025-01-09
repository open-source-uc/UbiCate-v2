import { NextRequest, NextResponse } from "next/server";

import { Feature } from "../../../utils/types";

const GITHUB_TOKEN_USER = process.env.GITHUB_TOKEN_USER;
const GITHUB_BRANCH_NAME = process.env.GITHUB_BRANCH_NAME;
const GITHUB_USER_EMAIL = process.env.GITHUB_USER_EMAIL;

interface Places {
  type: string;
  features: Feature[];
}

interface Place {
  information: string;
  identifier: string;
  floor: number;
  latitude: number;
  longitude: number;
  name: string;
  campus: string;
  categories: string;
}

function getID(place: Feature) {
  return place.properties.name + "-" + place.properties.categories + "-" + place.properties.campus;
}

async function createPlace(url: string, identifier: string, file_places: Places, file_sha: string) {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN_USER}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      message: `CREATE: '${identifier}'`,
      committer: {
        name: "BOT-PLACES",
        email: GITHUB_USER_EMAIL,
      },
      content: Buffer.from(JSON.stringify(file_places)).toString("base64"),
      sha: file_sha,
      branch: GITHUB_BRANCH_NAME,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
}

async function updatePlace(url: string, identifier: string, file_places: Places, file_sha: string) {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN_USER}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      message: `UPDATE: ${identifier}`,
      committer: {
        name: "BOT-PLACES",
        email: GITHUB_USER_EMAIL,
      },
      content: Buffer.from(JSON.stringify(file_places)).toString("base64"),
      sha: file_sha,
      branch: GITHUB_BRANCH_NAME,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
}

async function fetchPlaces(): Promise<{ url: string; file_places: Places; file_sha: string }> {
  const path = "data/places.json";
  const url = `https://api.github.com/repos/open-source-uc/UbiCate-v2/contents/${path}?ref=${GITHUB_BRANCH_NAME}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN_USER}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
    }

    const fileData = await response.json();
    const file_sha = fileData.sha;
    const file_places: Places = JSON.parse(Buffer.from(fileData.content, "base64").toString());

    return { url, file_places, file_sha };
  } catch (error) {
    console.error("Error fetching places:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Place = await request.json();

    const nuevo_punto: Feature = {
      type: "Feature",
      properties: {
        identifier: "", //Esto se hizo pues debe ser unico y si se usara el "body.name" podria pasar que identifier se duplicara por ejemplo el caso de los baños
        name: body.name,
        information: body.information,
        categories: [body.categories],
        campus: body.campus,
        faculties: "",
        floors: [body.floor],
        needApproval: true,
      },
      geometry: {
        type: "Point",
        coordinates: [body.longitude, body.latitude],
      },
    };

    if (nuevo_punto.properties.categories.includes("classroom")) {
      nuevo_punto.properties.identifier =
        nuevo_punto.properties.name.trim().toUpperCase().replaceAll(" ", "_") +
        "-" +
        nuevo_punto.properties.campus.toUpperCase();
    } else {
      const startOfYear2024 = new Date("2024-01-01T00:00:00");

      const now = new Date().getTime();
      const diffInMilliseconds = now - startOfYear2024.getTime();
      const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

      nuevo_punto.properties.identifier = nuevo_punto.properties.categories + "-" + diffInSeconds.toString();
    }

    const { url, file_places, file_sha } = await fetchPlaces();

    const index = file_places.features.findIndex(
      (feature: Feature) =>
        feature.properties.identifier.toUpperCase() === nuevo_punto.properties.identifier.toUpperCase(),
    );

    if (index !== -1) {
      return NextResponse.json(
        { message: "¡El lugar ya existe!" },
        {
          status: 400,
        },
      );
    }
    /*
    Sistema de crear un nuevo lugar
    */

    file_places.features.unshift(nuevo_punto);
    await createPlace(url, getID(nuevo_punto), file_places, file_sha);
    return NextResponse.json({
      message: "¡El lugar fue creado! Ahora debe esperar a que sea aprobado (máximo 1 semana).",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error al procesar el JSON" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: Place = await request.json();
    const nuevo_punto: Feature = {
      type: "Feature",
      properties: {
        identifier: body.identifier, //Esto se hizo pues debe ser unico y si se usara el "body.name" podria pasar que identifier se duplicara por ejemplo el caso de los baños
        name: body.name,
        information: body.information,
        categories: [body.categories],
        campus: body.campus,
        faculties: "",
        floors: [body.floor],
      },
      geometry: {
        type: "Point",
        coordinates: [body.longitude, body.latitude],
      },
    };

    const { url, file_places, file_sha } = await fetchPlaces();

    const index = file_places.features.findIndex(
      (feature: Feature) =>
        feature.properties.identifier.toUpperCase() === nuevo_punto.properties.identifier.toUpperCase(),
    );

    if (index == -1) {
      return NextResponse.json(
        { message: "¡El lugar NO existe!" },
        {
          status: 400,
        },
      );
    }

    const place: Feature = file_places.features[index];
    file_places.features.splice(index, 1);

    place.properties.campus = body.campus;
    place.properties.categories = [body.categories];
    place.properties.floors = [body.floor];
    place.properties.information = body.information;
    place.properties.name = body.name;
    place.properties.needApproval = true;
    place.geometry.coordinates[0] = body.longitude;
    place.geometry.coordinates[1] = body.latitude;

    file_places.features.unshift(place);

    await updatePlace(url, place.properties.identifier, file_places, file_sha);

    return NextResponse.json(
      { message: "¡El lugar fue actualizado! Ahora debe esperar a que sea aprobado (máximo 1 semana)." },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json({}, { status: 400 });
  }
}

export async function GET() {
  const { file_places } = await fetchPlaces();
  return NextResponse.json({ message: "Hello world!", file_places }, { status: 200 });
}

export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN_USER = process.env.GITHUB_TOKEN_USER;
const BRANCH_NAME = "bot-data-ABCD12";
const GITHUB_USER_EMAIL = process.env.GITHUB_USER_EMAIL;

interface Feature {
  type: "Feature";
  properties: {
    identifier: string;
    name: string;
    information: string;
    categories: string;
    campus: string;
    faculties: string;
    floor: number;
    category: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

const name_to_sigla = {
  SanJoaquin: "SJ",
  LoContador: "LC",
  Villarrica: "VR",
  CasaCentral: "CC",
  Oriente: "OR",
};

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

interface Places {
  type: string;
  features: Feature[];
}

async function exist_branch() {
  try {
    const response = await fetch(`https://api.github.com/repos/open-source-uc/UbiCate-v2/branches/${BRANCH_NAME}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN_USER}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
    return false;
  }
}

async function create_branch() {
  const baseBranchResponse = await fetch("https://api.github.com/repos/open-source-uc/UbiCate-v2/git/refs/heads/main", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN_USER}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  const baseBranchData = await baseBranchResponse.json();
  const baseBranchSHA = baseBranchData.object.sha;

  const branchData = {
    ref: `refs/heads/${BRANCH_NAME}`,
    sha: baseBranchSHA,
  };

  await fetch("https://api.github.com/repos/open-source-uc/UbiCate-v2/git/refs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN_USER}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(branchData),
  });
}

async function create_place(url: string, identifier: string, file_places: Places, file_sha: string) {
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
      branch: BRANCH_NAME,
    }),
  });
  const data = await response.json();
  return data;
}

async function update_place(url: string, identifier: string, file_places: Places, file_sha: string) {
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
      branch: BRANCH_NAME,
    }),
  });
  const data = await response.json();
  return data;
}

function getID(place: Feature) {
  return place.properties.name + "-" + place.properties.categories + "-" + place.properties.campus;
}

export async function POST(request: NextRequest) {
  try {
    const body: Place = await request.json();
    const today = new Date();
    const nuevo_punto: Feature = {
      type: "Feature",
      properties: {
        identifier: body.identifier, //Esto se hizo pues debe ser unico y si se usara el "body.name" podria pasar que identifier se duplicara por ejemplo el caso de los baños
        name: body.name,
        information: body.information,
        categories: body.categories,
        campus: body.campus,
        faculties: "",
        floor: body.floor,
        category: "",
      },
      geometry: {
        type: "Point",
        coordinates: [body.longitude, body.latitude],
      },
    };

    const exist = await exist_branch();
    if (exist === false) {
      await create_branch();
    }

    const path = "data/places.json";
    const url = `https://api.github.com/repos/open-source-uc/UbiCate-v2/contents/${path}?ref=${BRANCH_NAME}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN_USER}`,
        Accept: "application/vnd.github+json",
      },
    });

    const file_data = await response.json();
    const file_sha = file_data.sha;
    const file_places: Places = JSON.parse(Buffer.from(file_data.content, "base64").toString());

    const index = file_places.features.findIndex(
      (feature: Feature) =>
        feature.properties.identifier.toUpperCase() === nuevo_punto.properties.identifier.toUpperCase(),
    );

    if (index !== -1) {
      /*
      Futuro sistema para actualizar un lugar
      */
      const place: Feature = file_places.features[index];
      place.geometry.coordinates[0] = nuevo_punto.geometry.coordinates[0];
      place.geometry.coordinates[1] = nuevo_punto.geometry.coordinates[1];
      place.properties.campus = nuevo_punto.properties.campus;
      place.properties.categories = nuevo_punto.properties.categories;
      // place.properties.category = nuevo_punto.properties.category; // Esta vacia
      place.properties.faculties = nuevo_punto.properties.faculties;
      place.properties.floor = nuevo_punto.properties.floor;
      // place.properties.identifier NO SE PUEDE EDITAR PUES ES LA ID UNICA
      place.properties.information = nuevo_punto.properties.information;
      place.properties.name = nuevo_punto.properties.name;
      await update_place(url, getID(place), file_places, file_sha);

      return NextResponse.json(
        { message: "¡El lugar fue actualizado!" },
        {
          status: 200,
        },
      );
    } else {
      /*
      Sistema de crear un nuevo lugar
      */
      if (nuevo_punto.properties.categories === "classroom") {
        nuevo_punto.properties.identifier = nuevo_punto.properties.name.trim().toUpperCase().replaceAll(" ", "_");
      } else {
        const startOfYear2024 = new Date("2024-01-01T00:00:00");

        const now = new Date().getTime();

        const diffInMilliseconds = now - startOfYear2024.getTime();
        const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
        nuevo_punto.properties.identifier = nuevo_punto.properties.categories + "-" + diffInSeconds.toString();
      }
      file_places.features.unshift(nuevo_punto);
      await create_place(url, getID(nuevo_punto), file_places, file_sha);
      return NextResponse.json({ message: "¡El lugar fue creado!" });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error al procesar el JSON" }, { status: 400 });
  }
}

export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN_USER = process.env.GITHUB_TOKEN_USER;
const BRANCH_NAME = "bot-data-ABCD12";
const GITHUB_USER_EMAIL = process.env.GITHUB_USER_EMAIL;

interface Place {
  information: string;
  floor: number;
  latitude: number;
  longitude: number;
  name: string;
}

interface Places {
  type: string;
  features: Object[];
}
interface PointGeometry {
  type: "Point";
  coordinates: [number, number];
}

interface Properties {
  identifier: string;
  name: string;
  information: string;
  categories: string;
  campus: string;
  faculties: string;
  floor: string;
  category: string;
}

interface Feature {
  type: "Feature";
  properties: Properties;
  geometry: PointGeometry;
}

async function exist_rama_edit_data() {
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

async function update_places(url: string, name: string, file_places: Places, file_sha: string) {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN_USER}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      message: `Lugar nuevo ${name}`,
      committer: {
        name: "BOT-PLACES",
        email: GITHUB_USER_EMAIL,
      },
      content: Buffer.from(JSON.stringify(file_places)).toString("base64"),
      sha: file_sha,
      branch: BRANCH_NAME,
    }),
  });
  const data = await response.json()
  return data
}

export async function POST(request: NextRequest) {
  try {
    const body: Place = await request.json()
    const nuevo_punto = {
      type: "Feature",
      properties: {
        identifier: body.name,
        name: body.name,
        information: body.information,
        categories: "",
        campus: "SJ",
        faculties: "",
        floor: body.floor,
        category: "classroom",
      },
      geometry: {
        type: "Point",
        coordinates: [body.longitude, body.latitude],
      },
    };

    const exist = await exist_rama_edit_data();
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
    file_places.features.push(nuevo_punto);

    await update_places(url, nuevo_punto.properties.name, file_places, file_sha)

    return NextResponse.json({ message: "GG", data: file_places.features.at(-1) });

  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Error al procesar el JSON" }, { status: 400 });
  }
}

export const runtime = "edge";

import "@/lib/setup-proxy";

import { NextRequest, NextResponse } from "next/server";

import { booleanClockwise } from "@turf/boolean-clockwise";
import { centroid } from "@turf/centroid";
import { z } from "zod";

import { getCampusNameFromPoint, getFacultiesIdsFromPoint } from "@/utils/getCampusBounds";
import { CATEGORIES, Feature } from "@/utils/types";

const GITHUB_TOKEN_USER = process.env.GITHUB_TOKEN_USER;
const GITHUB_BRANCH_NAME = process.env.GITHUB_BRANCH_NAME;
const GITHUB_USER_EMAIL = process.env.GITHUB_USER_EMAIL;
const API_UBICATE_SECRET = process.env.API_UBICATE_SECRET;

interface Places {
  type: string;
  features: Feature[];
}

interface GithubFileResponse {
  url: string;
  fileData: Places;
  file_sha: string;
}

// Normaliza identificadores para comparaciones consistentes
function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toUpperCase().replace(/\s+/g, "");
}

function generateRandomIdWithTimestamp() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return timestamp + randomPart;
}

// Crear archivo en GitHub
async function createGithubFile(path: string, initialContent: Places): Promise<GithubFileResponse> {
  const url = `https://api.github.com/repos/open-source-uc/UbiCate-v2/contents/${path}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN_USER}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: `CREATE: Initial file structure for ${path}`,
        committer: { name: "BOT-PLACES", email: GITHUB_USER_EMAIL },
        content: Buffer.from(JSON.stringify(initialContent, null, 4)).toString("base64"),
        branch: GITHUB_BRANCH_NAME,
      }),
    });

    if (!response.ok) {
      const errorData: any = await response.json();
      throw new Error(`Failed to create file ${path}: ${errorData.message}`);
    }

    const data: any = await response.json();
    return { url, fileData: initialContent, file_sha: data.content.sha };
  } catch (error) {
    console.error(`Error creating file ${path}:`, error);
    throw error;
  }
}

// Operación genérica sobre archivo GitHub
async function githubFileOperation(
  url: string,
  feature: Feature,
  file_places: Places,
  file_sha: string,
  operationType: string,
): Promise<any> {
  try {
    if (!file_sha && operationType !== "CREATE_FILE") {
      throw new Error(`Cannot perform ${operationType} operation: Missing file SHA`);
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN_USER}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: `${operationType}: ${feature.properties.name} (${feature.properties.identifier})`,
        committer: { name: "BOT-PLACES", email: GITHUB_USER_EMAIL },
        content: Buffer.from(JSON.stringify(file_places, null, 4)).toString("base64"),
        sha: file_sha,
        branch: GITHUB_BRANCH_NAME,
      }),
    });

    if (!response.ok) {
      const errorData: any = await response.json();
      if (errorData.message && errorData.message.includes("SHA")) {
        throw new Error(`Concurrent modification detected: ${errorData.message}`);
      }
      throw new Error(`GitHub API error (${response.status}): ${errorData.message}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in GitHub operation (${operationType}):`, error);
    throw error;
  }
}

// Leer archivo GitHub
async function fetchGithubFile(path: string): Promise<GithubFileResponse> {
  const url = `https://api.github.com/repos/open-source-uc/UbiCate-v2/contents/${path}?ref=${GITHUB_BRANCH_NAME}`;
  const emptyCollection: Places = { type: "FeatureCollection", features: [] };

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN_USER}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (response.status === 404) {
      console.log(`File ${path} not found. Creating new file.`);
      return await createGithubFile(path, emptyCollection);
    }

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
    }

    const fileData: any = await response.json();
    let parsedData: Places;

    try {
      parsedData = JSON.parse(Buffer.from(fileData.content, "base64").toString());
      if (!parsedData.type || !Array.isArray(parsedData.features)) {
        console.warn(`File ${path} has invalid structure. Resetting.`);
        parsedData = emptyCollection;
      }
    } catch (parseError) {
      console.error(`Error parsing JSON from ${path}. Resetting file:`, parseError);
      parsedData = emptyCollection;
    }

    return { url, fileData: parsedData, file_sha: fileData.sha };
  } catch (error) {
    console.error(`Error fetching file ${path}:`, error);
    throw error;
  }
}

// Reintentos approved
async function fetchApprovedPlaces(retryCount = 3): Promise<GithubFileResponse> {
  try {
    return await fetchGithubFile("data/places.json");
  } catch (error) {
    if (retryCount > 0) {
      console.log(`Retrying fetchApprovedPlaces. Attempts remaining: ${retryCount - 1}`);
      await new Promise((r) => setTimeout(r, 1000));
      return fetchApprovedPlaces(retryCount - 1);
    }
    throw error;
  }
}

// Reintentos new
async function fetchNewPlaces(retryCount = 3): Promise<GithubFileResponse> {
  try {
    return await fetchGithubFile("data/newPlaces.json");
  } catch (error) {
    if (retryCount > 0) {
      console.log(`Retrying fetchNewPlaces. Attempts remaining: ${retryCount - 1}`);
      await new Promise((r) => setTimeout(r, 1000));
      return fetchNewPlaces(retryCount - 1);
    }
    throw error;
  }
}

// Validaciones
const placeSchema = z.object({
  data: z.object({
    name: z.string({ required_error: "El nombre es obligatorio" }).min(2).max(60),
    information: z.string({ required_error: "La descripción es obligatoria" }).max(1024),
    categories: z
      .array(
        z.enum(Object.values(CATEGORIES) as [string, ...string[]], {
          errorMap: () => ({ message: "Categoría no válida" }),
        }),
      )
      .transform((arr) => [...new Set(arr)]),
    floors: z
      .array(z.number({ invalid_type_error: "Cada piso debe ser un número" }))
      .refine((arr) => arr === undefined || !arr.includes(0), { message: "El piso 0 no está permitido" })
      .optional()
      .transform((arr) => (arr ? [...new Set(arr)] : arr)),
  }),
  points: z.array(z.object({ geometry: z.object({ coordinates: z.tuple([z.number(), z.number()]) }) })),
});

const putSchema = placeSchema.extend({
  identifier: z.string({ required_error: "El identificador es obligatorio" }),
});

// Geo helpers
function createFeatureFromPoints(points: any[], properties: any): Feature | null {
  if (points.length === 1) {
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: points[0].geometry.coordinates },
      properties: {
        ...properties,
        campus: getCampusNameFromPoint(points[0].geometry.coordinates[0], points[0].geometry.coordinates[1]) ?? "",
        faculties: getFacultiesIdsFromPoint(points[0].geometry.coordinates[0], points[0].geometry.coordinates[1]) ?? [],
      },
    };
  } else if (points.length >= 3) {
    const coordinates = points.map((p) => p.geometry.coordinates);
    const closed =
      coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
      coordinates[0][1] === coordinates[coordinates.length - 1][1]
        ? coordinates
        : [...coordinates, coordinates[0]];
    const isClockwise = booleanClockwise(closed);
    const ordered = isClockwise ? closed.slice().reverse() : closed;
    const center = centroid({ type: "Polygon", coordinates: [ordered] }).geometry.coordinates as [number, number];

    return {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [ordered] },
      properties: {
        ...properties,
        campus: getCampusNameFromPoint(center[0], center[1]) ?? "",
        faculties: getFacultiesIdsFromPoint(center[0], center[1]) ?? [],
      },
    };
  }
  return null;
}

// Handlers
export async function GET() {
  try {
    const { fileData: approvedPlaces } = await fetchApprovedPlaces();
    const { fileData: newPlaces } = await fetchNewPlaces();

    return NextResponse.json(
      { message: "Success", approved_places: approvedPlaces, new_places: newPlaces },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json(
      { error: "Error retrieving places data", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = placeSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const points = result.data.points;
    if (points.length === 1 && (!result.data.data.floors || result.data.data.floors.length === 0)) {
      return NextResponse.json({ message: "Se requiere al menos un piso para crear un lugar" }, { status: 400 });
    }
    if (points.length === 2) {
      return NextResponse.json({ message: "Se requieren al menos 3 puntos para crear un polígono" }, { status: 400 });
    }

    let nuevo_punto = createFeatureFromPoints(points, {
      identifier: "",
      name: result.data.data.name,
      information: result.data.data.information,
      categories: result.data.data.categories,
      floors: result.data.data.floors,
      needApproval: true,
    });
    if (!nuevo_punto) {
      return NextResponse.json({ message: "Se requiere al menos 1 punto o 3 para polígono" }, { status: 400 });
    }
    if (nuevo_punto.properties.campus === "") {
      return NextResponse.json({ message: "El lugar no está dentro de un campus" }, { status: 400 });
    }

    if (nuevo_punto.properties.categories.includes("classroom")) {
      nuevo_punto.properties.identifier =
        nuevo_punto.properties.name.trim().toUpperCase().replaceAll(" ", "_") +
        "-" +
        nuevo_punto.properties.campus.toUpperCase();
    } else {
      nuevo_punto.properties.identifier = generateRandomIdWithTimestamp();
    }

    nuevo_punto.properties.identifier = normalizeIdentifier(nuevo_punto.properties.identifier);
    const normalizedIdentifier = normalizeIdentifier(nuevo_punto.properties.identifier);

    const { fileData: approvedPlaces } = await fetchApprovedPlaces();
    const existsInApproved = approvedPlaces.features.some(
      (f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedIdentifier,
    );
    if (existsInApproved) {
      return NextResponse.json({ message: "¡El lugar ya existe en lugares aprobados!" }, { status: 400 });
    }

    const { url: newPlacesUrl, fileData: newPlaces, file_sha: newPlacesSha } = await fetchNewPlaces();
    const existsInNew = newPlaces.features.some(
      (f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedIdentifier,
    );
    if (existsInNew) {
      return NextResponse.json({ message: "¡El lugar ya existe en pendientes de aprobación!" }, { status: 400 });
    }

    newPlaces.features.unshift(nuevo_punto);
    await githubFileOperation(newPlacesUrl, nuevo_punto, newPlaces, newPlacesSha, "CREATE");

    return NextResponse.json(
      {
        message: "¡El lugar fue creado! Ahora debe esperar aprobación (máx. 1 semana).",
        identifier: nuevo_punto.properties.identifier,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      { error: "Error al procesar el JSON", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = putSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const normalizedIdentifier = normalizeIdentifier(result.data.identifier);
    const points = result.data.points;

    const { fileData: approvedPlaces } = await fetchApprovedPlaces();
    const approvedIndex = approvedPlaces.features.findIndex(
      (f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedIdentifier,
    );

    const { url: newPlacesUrl, fileData: newPlaces, file_sha: newPlacesSha } = await fetchNewPlaces();
    const newPlacesIndex = newPlaces.features.findIndex(
      (f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedIdentifier,
    );

    if (approvedIndex === -1 && newPlacesIndex === -1) {
      return NextResponse.json({ message: "¡El lugar NO existe!" }, { status: 400 });
    }

    let actualizado_punto = createFeatureFromPoints(points, {
      identifier: result.data.identifier,
      name: result.data.data.name,
      information: result.data.data.information,
      categories: result.data.data.categories,
      floors: result.data.data.floors,
      needApproval: true,
    });
    if (!actualizado_punto) {
      return NextResponse.json({ message: "Se requiere al menos 1 punto o 3 para polígono" }, { status: 400 });
    }
    if (actualizado_punto.properties.campus === "") {
      return NextResponse.json({ message: "El lugar no está dentro de un campus" }, { status: 400 });
    }

    try {
      if (newPlacesIndex !== -1) {
        newPlaces.features.splice(newPlacesIndex, 1);
        newPlaces.features.unshift(actualizado_punto);
        await githubFileOperation(newPlacesUrl, actualizado_punto, newPlaces, newPlacesSha, "UPDATE");
      } else {
        newPlaces.features.unshift(actualizado_punto);
        await githubFileOperation(newPlacesUrl, actualizado_punto, newPlaces, newPlacesSha, "UPDATE");
      }

      return NextResponse.json(
        {
          message: "¡El lugar fue actualizado! Ahora debe esperar aprobación (máx. 1 semana).",
          identifier: actualizado_punto.properties.identifier,
        },
        { status: 200 },
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("Concurrent modification")) {
        return NextResponse.json({ message: "Modificación concurrente. Intenta nuevamente." }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in PUT:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("ubicate-token");
    if (token !== API_UBICATE_SECRET) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const patchSchema = z.object({ identifier: z.string({ required_error: "El identificador es obligatorio" }) });
    const body = await request.json();
    const result = patchSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const normalizedIdentifier = normalizeIdentifier(result.data.identifier);
    const { url: newPlacesUrl, fileData: newPlaces, file_sha: newPlacesSha } = await fetchNewPlaces();
    const newPlacesIndex = newPlaces.features.findIndex(
      (f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedIdentifier,
    );
    if (newPlacesIndex === -1) {
      return NextResponse.json({ message: "¡El lugar NO existe en pendientes!" }, { status: 404 });
    }

    const placeToApprove = { ...newPlaces.features[newPlacesIndex] };
    if ("needApproval" in placeToApprove.properties) delete placeToApprove.properties.needApproval;

    try {
      const {
        url: approvedPlacesUrl,
        fileData: approvedPlaces,
        file_sha: approvedPlacesSha,
      } = await fetchApprovedPlaces();
      const approvedIndex = approvedPlaces.features.findIndex(
        (f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedIdentifier,
      );
      if (approvedIndex !== -1) approvedPlaces.features.splice(approvedIndex, 1);

      approvedPlaces.features.push(placeToApprove);
      await githubFileOperation(approvedPlacesUrl, placeToApprove, approvedPlaces, approvedPlacesSha, "APPROVE");

      newPlaces.features.splice(newPlacesIndex, 1);
      await githubFileOperation(newPlacesUrl, placeToApprove, newPlaces, newPlacesSha, "REMOVE_FROM_NEW");

      return NextResponse.json({ message: "¡El lugar fue APROBADO y agregado al final!" }, { status: 200 });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Concurrent modification")) {
        return NextResponse.json({ message: "Modificación concurrente. Intenta nuevamente." }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in PATCH:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("ubicate-token");
    if (token !== API_UBICATE_SECRET) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const deleteSchema = z.object({
      identifier: z.string({ required_error: "El identificador es obligatorio" }),
      source: z.enum(["approved", "pending"], { required_error: "El origen es obligatorio" }),
    });

    const body = await request.json();
    const result = deleteSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const normalizedIdentifier = normalizeIdentifier(result.data.identifier);
    const { source } = result.data;

    try {
      let deleted = false;
      let deletedFrom = "";

      if (source === "approved") {
        const {
          url: approvedPlacesUrl,
          fileData: approvedPlaces,
          file_sha: approvedPlacesSha,
        } = await fetchApprovedPlaces();
        const approvedIndex = approvedPlaces.features.findIndex(
          (f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedIdentifier,
        );
        if (approvedIndex !== -1) {
          const placeToDelete = approvedPlaces.features[approvedIndex];
          approvedPlaces.features.splice(approvedIndex, 1);
          await githubFileOperation(approvedPlacesUrl, placeToDelete, approvedPlaces, approvedPlacesSha, "DELETE");
          deleted = true;
          deletedFrom = "lugares aprobados";
        }
      } else if (source === "pending") {
        const { url: newPlacesUrl, fileData: newPlaces, file_sha: newPlacesSha } = await fetchNewPlaces();
        const newPlacesIndex = newPlaces.features.findIndex(
          (f: Feature) => normalizeIdentifier(f.properties.identifier) === normalizedIdentifier,
        );
        if (newPlacesIndex !== -1) {
          const placeToDelete = newPlaces.features[newPlacesIndex];
          newPlaces.features.splice(newPlacesIndex, 1);
          await githubFileOperation(newPlacesUrl, placeToDelete, newPlaces, newPlacesSha, "DELETE_FROM_NEW");
          deleted = true;
          deletedFrom = "lugares pendientes de aprobación";
        }
      }

      if (deleted) {
        return NextResponse.json({ message: `¡El lugar fue borrado de ${deletedFrom}!` }, { status: 200 });
      } else {
        const sourceText = source === "approved" ? "lugares aprobados" : "lugares pendientes de aprobación";
        return NextResponse.json({ message: `¡El lugar NO existe en ${sourceText}!` }, { status: 404 });
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("Concurrent modification")) {
        return NextResponse.json({ message: "Modificación concurrente. Intenta nuevamente." }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in DELETE:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}

export const runtime = "nodejs";

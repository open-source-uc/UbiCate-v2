import { NextRequest, NextResponse } from "next/server";

import { Feature } from "../../../utils/types";

const GITHUB_TOKEN_USER = process.env.GITHUB_TOKEN_USER;
const GITHUB_BRANCH_NAME = process.env.GITHUB_BRANCH_NAME;
const GITHUB_USER_EMAIL = process.env.GITHUB_USER_EMAIL;
const API_UBICATE_SECRET = process.env.API_UBICATE_SECRET;

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
  const timestamp = Date.now().toString(36); // Get timestamp in base-36
  const randomPart = Math.random().toString(36).substring(2, 8); // Shorter random part
  return timestamp + randomPart; // Concatenate timestamp and random part
}

function getID(place: Feature) {
  return place.properties.name + "-" + place.properties.categories + "-" + place.properties.campus;
}

// Función para crear un archivo nuevo en GitHub
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
        committer: {
          name: "BOT-PLACES",
          email: GITHUB_USER_EMAIL,
        },
        content: Buffer.from(JSON.stringify(initialContent, null, 4)).toString("base64"),
        branch: GITHUB_BRANCH_NAME,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create file ${path}: ${errorData.message}`);
    }

    const data = await response.json();

    return {
      url,
      fileData: initialContent,
      file_sha: data.content.sha,
    };
  } catch (error) {
    console.error(`Error creating file ${path}:`, error);
    throw error;
  }
}

// Función mejorada para interactuar con archivos en GitHub
async function githubFileOperation(
  url: string,
  identifier: string,
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
        message: `${operationType}: ${identifier}`,
        committer: {
          name: "BOT-PLACES",
          email: GITHUB_USER_EMAIL,
        },
        content: Buffer.from(JSON.stringify(file_places, null, 4)).toString("base64"),
        sha: file_sha,
        branch: GITHUB_BRANCH_NAME,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Si es un error de SHA, podría ser una condición de carrera
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

// Función mejorada para obtener archivo de GitHub
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

    // Si el archivo no existe, crearlo
    if (response.status === 404) {
      console.log(`File ${path} not found. Creating new file.`);
      return await createGithubFile(path, emptyCollection);
    }

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
    }

    const fileData = await response.json();
    let parsedData: Places;

    try {
      parsedData = JSON.parse(Buffer.from(fileData.content, "base64").toString());

      // Validar la estructura básica del archivo
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

// Obtener lugares aprobados con manejo de reintentos
async function fetchApprovedPlaces(retryCount = 3): Promise<GithubFileResponse> {
  try {
    return await fetchGithubFile("data/places.json");
  } catch (error) {
    if (retryCount > 0) {
      console.log(`Retrying fetchApprovedPlaces. Attempts remaining: ${retryCount - 1}`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar 1 segundo antes de reintentar
      return fetchApprovedPlaces(retryCount - 1);
    }
    throw error;
  }
}

// Obtener lugares nuevos o en proceso de aprobación con manejo de reintentos
async function fetchNewPlaces(retryCount = 3): Promise<GithubFileResponse> {
  try {
    return await fetchGithubFile("data/newPlaces.json");
  } catch (error) {
    if (retryCount > 0) {
      console.log(`Retrying fetchNewPlaces. Attempts remaining: ${retryCount - 1}`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar 1 segundo antes de reintentar
      return fetchNewPlaces(retryCount - 1);
    }
    throw error;
  }
}

export async function GET() {
  try {
    const { fileData: approvedPlaces } = await fetchApprovedPlaces();
    const { fileData: newPlaces } = await fetchNewPlaces();

    return NextResponse.json(
      {
        message: "Success",
        approved_places: approvedPlaces,
        new_places: newPlaces,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json(
      {
        error: "Error retrieving places data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Place = await request.json();

    // Validar campos requeridos
    const requiredFields = ["name", "information", "categories", "campus", "floor", "latitude", "longitude"];
    for (const field of requiredFields) {
      if (body[field as keyof Place] === undefined || body[field as keyof Place] === null) {
        return NextResponse.json({ message: `El campo ${field} es obligatorio` }, { status: 400 });
      }
    }

    const nuevo_punto: Feature = {
      type: "Feature",
      properties: {
        identifier: "", // Se generará un identificador único
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

    // Generar identificador
    if (nuevo_punto.properties.categories.includes("classroom")) {
      nuevo_punto.properties.identifier =
        nuevo_punto.properties.name.trim().toUpperCase().replaceAll(" ", "_") +
        "-" +
        nuevo_punto.properties.campus.toUpperCase();
    } else {
      nuevo_punto.properties.identifier = generateRandomIdWithTimestamp();
    }

    const normalizedIdentifier = normalizeIdentifier(nuevo_punto.properties.identifier);

    // Verificar si el lugar ya existe en lugares aprobados
    const { fileData: approvedPlaces } = await fetchApprovedPlaces();
    const existsInApproved = approvedPlaces.features.some(
      (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
    );

    if (existsInApproved) {
      return NextResponse.json({ message: "¡El lugar ya existe en lugares aprobados!" }, { status: 400 });
    }

    // Verificar si el lugar ya existe en lugares nuevos
    const { url: newPlacesUrl, fileData: newPlaces, file_sha: newPlacesSha } = await fetchNewPlaces();
    const existsInNewPlaces = newPlaces.features.some(
      (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
    );

    if (existsInNewPlaces) {
      return NextResponse.json(
        { message: "¡El lugar ya existe en lugares pendientes de aprobación!" },
        { status: 400 },
      );
    }

    // Añadir el nuevo lugar al archivo de lugares nuevos
    newPlaces.features.unshift(nuevo_punto);
    await githubFileOperation(newPlacesUrl, getID(nuevo_punto), newPlaces, newPlacesSha, "CREATE");

    return NextResponse.json({
      message: "¡El lugar fue creado! Ahora debe esperar a que sea aprobado (máximo 1 semana).",
      identifier: nuevo_punto.properties.identifier,
    });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      {
        error: "Error al procesar el JSON",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: Place = await request.json();

    if (!body.identifier) {
      return NextResponse.json({ message: "El identificador es obligatorio" }, { status: 400 });
    }

    const normalizedIdentifier = normalizeIdentifier(body.identifier);

    // Verificar si el lugar existe en lugares aprobados
    const { fileData: approvedPlaces } = await fetchApprovedPlaces();
    const approvedIndex = approvedPlaces.features.findIndex(
      (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
    );

    // Verificar si el lugar existe en lugares nuevos
    const { url: newPlacesUrl, fileData: newPlaces, file_sha: newPlacesSha } = await fetchNewPlaces();
    const newPlacesIndex = newPlaces.features.findIndex(
      (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
    );

    // Si no existe en ningún archivo, retornar error
    if (approvedIndex === -1 && newPlacesIndex === -1) {
      return NextResponse.json({ message: "¡El lugar NO existe!" }, { status: 400 });
    }

    // Crear el punto actualizado
    const nuevo_punto: Feature = {
      type: "Feature",
      properties: {
        identifier: body.identifier,
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

    try {
      // Si existe en lugares nuevos, actualizarlo
      if (newPlacesIndex !== -1) {
        newPlaces.features.splice(newPlacesIndex, 1);
        newPlaces.features.unshift(nuevo_punto);
        await githubFileOperation(newPlacesUrl, nuevo_punto.properties.identifier, newPlaces, newPlacesSha, "UPDATE");
      } else {
        // Si solo existe en lugares aprobados, agregarlo a lugares nuevos
        newPlaces.features.unshift(nuevo_punto);
        await githubFileOperation(newPlacesUrl, nuevo_punto.properties.identifier, newPlaces, newPlacesSha, "UPDATE");
      }

      return NextResponse.json(
        { message: "¡El lugar fue actualizado! Ahora debe esperar a que sea aprobado (máximo 1 semana)." },
        { status: 200 },
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("Concurrent modification")) {
        // Reintentar la operación con datos frescos
        return NextResponse.json(
          {
            message:
              "La operación no pudo completarse debido a una modificación concurrente. Por favor, inténtelo nuevamente.",
          },
          { status: 409 }, // Conflict
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in PUT:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        message: error instanceof Error ? error.message : "Unknown error",
      },
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

    const body: {
      identifier: string;
    } = await request.json();

    if (!body.identifier) {
      return NextResponse.json({ message: "El identificador es obligatorio" }, { status: 400 });
    }

    const normalizedIdentifier = normalizeIdentifier(body.identifier);

    // Obtener lugares nuevos
    const { url: newPlacesUrl, fileData: newPlaces, file_sha: newPlacesSha } = await fetchNewPlaces();

    // Buscar el lugar en lugares nuevos
    const newPlacesIndex = newPlaces.features.findIndex(
      (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
    );

    if (newPlacesIndex === -1) {
      return NextResponse.json(
        { message: "¡El lugar NO existe en lugares pendientes de aprobación!" },
        { status: 404 },
      );
    }

    // Obtener el lugar a aprobar
    const placeToApprove = { ...newPlaces.features[newPlacesIndex] };

    // Eliminar la marca de necesidad de aprobación
    placeToApprove.properties.needApproval = false;

    try {
      // Ejecutar operaciones como una transacción (lo mejor posible sin soporte nativo)

      // 1. Obtener lugares aprobados actualizados
      const {
        url: approvedPlacesUrl,
        fileData: approvedPlaces,
        file_sha: approvedPlacesSha,
      } = await fetchApprovedPlaces();

      // 2. Verificar si ya existe en lugares aprobados
      const approvedIndex = approvedPlaces.features.findIndex(
        (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
      );

      // 3. Si ya existe, eliminarlo
      if (approvedIndex !== -1) {
        approvedPlaces.features.splice(approvedIndex, 1);
      }

      // 4. Agregar el lugar aprobado AL FINAL del array de lugares aprobados
      approvedPlaces.features.push(placeToApprove);

      // 5. Actualizar archivo de lugares aprobados
      await githubFileOperation(
        approvedPlacesUrl,
        placeToApprove.properties.identifier,
        approvedPlaces,
        approvedPlacesSha,
        "APPROVE",
      );

      // 6. Actualizar newPlaces (remover el lugar aprobado)
      newPlaces.features.splice(newPlacesIndex, 1);

      // 7. Guardar cambios en newPlaces
      await githubFileOperation(
        newPlacesUrl,
        placeToApprove.properties.identifier,
        newPlaces,
        newPlacesSha,
        "REMOVE_FROM_NEW",
      );

      return NextResponse.json(
        { message: "¡El lugar fue APROBADO y agregado al final de la lista de lugares aprobados!" },
        { status: 200 },
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("Concurrent modification")) {
        return NextResponse.json(
          {
            message:
              "La operación no pudo completarse debido a una modificación concurrente. Por favor, inténtelo nuevamente.",
          },
          { status: 409 }, // Conflict
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in PATCH:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        message: error instanceof Error ? error.message : "Unknown error",
      },
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

    const body: {
      identifier: string;
    } = await request.json();

    if (!body.identifier) {
      return NextResponse.json({ message: "El identificador es obligatorio" }, { status: 400 });
    }

    const normalizedIdentifier = normalizeIdentifier(body.identifier);

    try {
      // Verificar en lugares aprobados
      const {
        url: approvedPlacesUrl,
        fileData: approvedPlaces,
        file_sha: approvedPlacesSha,
      } = await fetchApprovedPlaces();

      const approvedIndex = approvedPlaces.features.findIndex(
        (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
      );

      // Si existe en lugares aprobados, eliminarlo
      let deleted = false;
      if (approvedIndex !== -1) {
        const placeToDelete = approvedPlaces.features[approvedIndex];
        approvedPlaces.features.splice(approvedIndex, 1);

        await githubFileOperation(
          approvedPlacesUrl,
          placeToDelete.properties.identifier,
          approvedPlaces,
          approvedPlacesSha,
          "DELETE",
        );
        deleted = true;
      }

      const { url: newPlacesUrl, fileData: newPlaces, file_sha: newPlacesSha } = await fetchNewPlaces();

      const newPlacesIndex = newPlaces.features.findIndex(
        (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
      );

      // Si existe en lugares nuevos, eliminarlo
      if (newPlacesIndex !== -1) {
        const placeToDelete = newPlaces.features[newPlacesIndex];
        newPlaces.features.splice(newPlacesIndex, 1);

        await githubFileOperation(
          newPlacesUrl,
          placeToDelete.properties.identifier,
          newPlaces,
          newPlacesSha,
          "DELETE_FROM_NEW",
        );
        deleted = true;
      }
      if (deleted) {
        return NextResponse.json(
          { message: "¡El lugar fue borrado de lugares pendientes de aprobación!" },
          { status: 200 },
        );
      } else {
        // Si no está en ningún archivo
        return NextResponse.json({ message: "¡El lugar NO existe!" }, { status: 404 });
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("Concurrent modification")) {
        return NextResponse.json(
          {
            message:
              "La operación no pudo completarse debido a una modificación concurrente. Por favor, inténtelo nuevamente.",
          },
          { status: 409 }, // Conflict
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in DELETE:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}

export const runtime = "edge";

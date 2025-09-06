import { Feature } from "@/lib/types";

import { GITHUB_BRANCH_NAME, GITHUB_TOKEN_USER, GITHUB_USER_EMAIL } from "./config";
import { GithubFileResponse, Places } from "./types";

// Función para crear un archivo nuevo en GitHub
export async function createGithubFile(path: string, initialContent: Places): Promise<GithubFileResponse> {
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
      const errorData: any = await response.json();
      throw new Error(`Failed to create file ${path}: ${errorData.message}`);
    }

    const data: any = await response.json();
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
export async function githubFileOperation(
  url: string,
  feature: Feature,
  file_places: Places,
  file_sha: string,
  operationType: string,
): Promise<any> {
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN_USER}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: `${operationType}: ${feature.properties.name} (${feature.properties.identifier})`,
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
      const errorData: any = await response.json();
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
export async function fetchGithubFile(path: string): Promise<GithubFileResponse> {
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

    const fileData: any = await response.json();
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
export async function fetchApprovedPlaces(retryCount = 3): Promise<GithubFileResponse> {
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
export async function fetchNewPlaces(retryCount = 3): Promise<GithubFileResponse> {
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

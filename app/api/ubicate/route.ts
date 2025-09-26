import { NextRequest, NextResponse } from "next/server";

import { fetchApprovedPlaces, fetchNewPlaces, githubFileOperation } from "@/lib/github/operations";
import { createFeatureFromPoints, generateRandomIdWithTimestamp, normalizeIdentifier } from "@/lib/places/utils";
import { Feature } from "@/lib/types";
import { deleteSchema, patchSchema, placeSchema, putSchema } from "@/lib/validation/schemas";

const API_UBICATE_SECRET = process.env.API_UBICATE_SECRET;

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
    const body = await request.json();
    const result = placeSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const points = result.data.points;
    if (points.length === 1 && (result.data.data.floors === undefined || result.data.data.floors?.length === 0)) {
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
      return NextResponse.json(
        {
          message: "Se requiere al menos 1 punto para ubicar un lugar o 3 puntos para crear un polígono",
        },
        { status: 400 },
      );
    }

    if (nuevo_punto.properties.campus === "") {
      return NextResponse.json({ message: "El lugar no está dentro de un campus" }, { status: 400 });
    }

    // Generar identificador
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
    await githubFileOperation(newPlacesUrl, nuevo_punto, newPlaces, newPlacesSha, "CREATE");
    return NextResponse.json({
      message: "¡El lugar fue creado! Ahora debe esperar a que sea aprobado (máximo 1 semana).",
    });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        message: error instanceof Error ? error.message : "Unknown error",
      },
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

    const points = result.data.points;

    if (points.length === 1 && (result.data.data.floors === undefined || result.data.data.floors?.length === 0)) {
      return NextResponse.json({ message: "Se requiere al menos un piso para crear un lugar" }, { status: 400 });
    }

    if (points.length === 2) {
      return NextResponse.json({ message: "Se requieren al menos 3 puntos para crear un polígono" }, { status: 400 });
    }

    let updated_point = createFeatureFromPoints(points, {
      identifier: result.data.identifier,
      name: result.data.data.name,
      information: result.data.data.information,
      categories: result.data.data.categories,
      floors: result.data.data.floors,
      needApproval: true,
    });

    if (!updated_point) {
      return NextResponse.json(
        {
          message: "Se requiere al menos 1 punto para ubicar un lugar o 3 puntos para crear un polígono",
        },
        { status: 400 },
      );
    }

    if (updated_point.properties.campus === "") {
      return NextResponse.json({ message: "El lugar no está dentro de un campus" }, { status: 400 });
    }

    const normalizedIdentifier = normalizeIdentifier(result.data.identifier);

    try {
      // Buscar y actualizar en lugares nuevos
      const { url: newPlacesUrl, fileData: newPlaces, file_sha: newPlacesSha } = await fetchNewPlaces();
      const newPlacesIndex = newPlaces.features.findIndex(
        (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
      );

      if (newPlacesIndex !== -1) {
        // Actualizar en lugares nuevos
        newPlaces.features[newPlacesIndex] = updated_point;
        await githubFileOperation(newPlacesUrl, updated_point, newPlaces, newPlacesSha, "UPDATE");
        return NextResponse.json({ message: "¡El lugar fue actualizado en lugares pendientes de aprobación!" });
      }

      // Si no está en lugares nuevos, verificar lugares aprobados
      const { fileData: approvedPlaces } = await fetchApprovedPlaces();
      const existsInApproved = approvedPlaces.features.some(
        (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
      );

      if (existsInApproved) {
        // Si el lugar está aprobado, crear una nueva propuesta de edición en newPlaces
        // Verificar que no haya ya una propuesta pendiente con el mismo identifier
        const hasPendingProposal = newPlaces.features.some(
          (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
        );

        if (hasPendingProposal) {
          return NextResponse.json(
            {
              message: "Ya existe una propuesta de edición pendiente para este lugar aprobado.",
            },
            { status: 400 },
          );
        }

        // Añadir la propuesta de edición a lugares nuevos
        newPlaces.features.unshift(updated_point);
        await githubFileOperation(newPlacesUrl, updated_point, newPlaces, newPlacesSha, "CREATE");
        return NextResponse.json({
          message: "¡Se ha creado una propuesta de edición para el lugar aprobado! Debe esperar a que sea aprobada.",
        });
      }

      return NextResponse.json({ message: "¡El lugar NO existe!" }, { status: 404 });
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

    const body = await request.json();
    const result = patchSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";

      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const normalizedIdentifier = normalizeIdentifier(result.data.identifier);
    const { action } = result.data;

    try {
      // Buscar el lugar en lugares nuevos
      const { url: newPlacesUrl, fileData: newPlaces, file_sha: newPlacesSha } = await fetchNewPlaces();
      const newPlacesIndex = newPlaces.features.findIndex(
        (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
      );

      if (newPlacesIndex === -1) {
        return NextResponse.json({ message: "¡El lugar NO existe en lugares pendientes!" }, { status: 404 });
      }

      const placeToMove = newPlaces.features[newPlacesIndex];

      if (action === "approve") {
        // Mover de lugares nuevos a lugares aprobados
        const {
          url: approvedPlacesUrl,
          fileData: approvedPlaces,
          file_sha: approvedPlacesSha,
        } = await fetchApprovedPlaces();

        // Remover needApproval antes de aprobar
        delete placeToMove.properties.needApproval;

        // Verificar que no exista ya en lugares aprobados
        const existingApprovedIndex = approvedPlaces.features.findIndex(
          (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
        );

        let isUpdate = false;
        if (existingApprovedIndex !== -1) {
          // Si ya existe, reemplazar el lugar existente con la nueva versión
          approvedPlaces.features[existingApprovedIndex] = placeToMove;
          await githubFileOperation(
            approvedPlacesUrl,
            placeToMove,
            approvedPlaces,
            approvedPlacesSha,
            "UPDATE_APPROVED",
          );
          isUpdate = true;
        } else {
          // Si no existe, añadir como nuevo lugar
          approvedPlaces.features.unshift(placeToMove);
          await githubFileOperation(approvedPlacesUrl, placeToMove, approvedPlaces, approvedPlacesSha, "APPROVE");
        }

        // Remover de lugares nuevos
        newPlaces.features.splice(newPlacesIndex, 1);
        await githubFileOperation(newPlacesUrl, placeToMove, newPlaces, newPlacesSha, "APPROVE_REMOVE_FROM_NEW");

        const message = isUpdate ? "¡La edición del lugar fue aprobada y actualizada!" : "¡El lugar fue aprobado!";
        return NextResponse.json({ message });
      } else if (action === "reject") {
        // Simplemente remover de lugares nuevos
        newPlaces.features.splice(newPlacesIndex, 1);
        await githubFileOperation(newPlacesUrl, placeToMove, newPlaces, newPlacesSha, "REJECT");
        return NextResponse.json({ message: "¡El lugar fue rechazado!" });
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
        // Solo buscar y eliminar de lugares aprobados
        const {
          url: approvedPlacesUrl,
          fileData: approvedPlaces,
          file_sha: approvedPlacesSha,
        } = await fetchApprovedPlaces();

        const approvedIndex = approvedPlaces.features.findIndex(
          (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
        );

        if (approvedIndex !== -1) {
          const placeToDelete = approvedPlaces.features[approvedIndex];
          approvedPlaces.features.splice(approvedIndex, 1);

          await githubFileOperation(approvedPlacesUrl, placeToDelete, approvedPlaces, approvedPlacesSha, "DELETE");
          deleted = true;
          deletedFrom = "lugares aprobados";
        }
      } else if (source === "pending") {
        // Solo buscar y eliminar de lugares pendientes
        const { url: newPlacesUrl, fileData: newPlaces, file_sha: newPlacesSha } = await fetchNewPlaces();

        const newPlacesIndex = newPlaces.features.findIndex(
          (feature: Feature) => normalizeIdentifier(feature.properties.identifier) === normalizedIdentifier,
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
        // Si no está en el archivo especificado
        const sourceText = source === "approved" ? "lugares aprobados" : "lugares pendientes de aprobación";
        return NextResponse.json({ message: `¡El lugar NO existe en ${sourceText}!` }, { status: 404 });
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

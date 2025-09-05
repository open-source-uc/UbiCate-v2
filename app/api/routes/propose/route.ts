import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

// Schema for route proposal
const routeProposalSchema = z.object({
  campus: z.string().min(1, "Campus es requerido"),
  startCoordinates: z.tuple([z.number(), z.number()], { required_error: "Coordenadas de inicio son requeridas" }),
  endCoordinates: z.tuple([z.number(), z.number()], { required_error: "Coordenadas de fin son requeridas" }),
  routeType: z.enum(["walkway", "stairs", "elevator", "covered_path", "outdoor_path"]).default("walkway"),
  description: z.string().optional(),
  userEmail: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = routeProposalSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Error de validación";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { campus, startCoordinates, endCoordinates, routeType, description, userEmail } = result.data;

    // For now, we'll store the proposal in a simple format
    // In a production environment, you might want to store this in a database
    // or send it to a review system

    const proposal = {
      id: `proposal_${Date.now()}`,
      campus,
      startCoordinates,
      endCoordinates,
      routeType,
      description,
      userEmail,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Log the proposal (in production, save to database)
    console.log("New route proposal:", proposal);

    // For demonstration purposes, we'll automatically add simple proposals
    // In production, these would go through a review process

    return NextResponse.json({
      message: "¡Propuesta de ruta recibida! Será revisada por nuestro equipo.",
      proposalId: proposal.id,
    });
  } catch (error) {
    console.error("Error in route proposal:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la propuesta",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Get pending route proposals (for administrators)
export async function GET() {
  try {
    // In production, fetch from database
    // For now, return a placeholder
    return NextResponse.json({
      proposals: [],
      message: "Funcionalidad de revisión de propuestas en desarrollo",
    });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json({ error: "Error al obtener propuestas" }, { status: 500 });
  }
}

export const runtime = "edge";

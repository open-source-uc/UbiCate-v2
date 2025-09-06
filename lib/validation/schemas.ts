import { z } from "zod";

// Esquema de validación común para POST y PUT
export const placeSchema = z.object({
  data: z.object({
    name: z
      .string({ required_error: "El nombre es obligatorio" })
      .min(1, "El nombre no puede estar vacío")
      .max(100, "El nombre no puede exceder 100 caracteres"),
    information: z
      .string({ required_error: "La información es obligatoria" })
      .min(1, "La información no puede estar vacía")
      .max(300, "La información no puede exceder 300 caracteres"),
    categories: z
      .array(z.string(), { required_error: "Las categorías son obligatorias" })
      .min(1, "Debe seleccionar al menos una categoría"),
    floors: z.array(z.number(), { required_error: "Los pisos son obligatorios" }).optional().default([]),
  }),
  points: z.array(
    z.object({
      geometry: z.object({
        type: z.literal("Point"),
        coordinates: z.array(z.number()).length(2),
      }),
      type: z.literal("Feature"),
      properties: z.object({}),
    }),
    { required_error: "Los puntos son obligatorios" },
  ),
});

export const putSchema = placeSchema.extend({
  identifier: z.string({ required_error: "El identificador es obligatorio" }),
});

export const deleteSchema = z.object({
  identifier: z.string({ required_error: "El identificador es obligatorio" }),
  source: z.enum(["approved", "pending"], {
    required_error: "El origen es obligatorio",
    invalid_type_error: "El origen debe ser 'approved' o 'pending'",
  }),
});

export const patchSchema = z.object({
  identifier: z.string({ required_error: "El identificador es obligatorio" }),
  action: z.enum(["approve", "reject"], {
    required_error: "La acción es obligatoria",
    invalid_type_error: "La acción debe ser 'approve' o 'reject'",
  }),
});

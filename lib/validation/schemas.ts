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
      .max(2500, "La información no puede exceder 2500 caracteres"),
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

// Schemas para eventos
const eventDateSchema = z.string({ required_error: "La fecha es obligatoria" }).min(1, "La fecha no puede estar vacía");

const eventLocationSchema = z
  .object({
    type: z.enum(["existing", "new"]),
    placeId: z.string().optional(),
    name: z.string().optional(),
    information: z.string().max(2500).optional(),
    identifier: z.string().optional(),
    points: z
      .array(
        z.object({
          geometry: z.object({
            type: z.literal("Point"),
            coordinates: z.array(z.number()).length(2),
          }),
          type: z.literal("Feature"),
          properties: z.object({}),
        }),
      )
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      if (data.type === "existing") return !!data.placeId && data.placeId.length > 0;
      if (data.type === "new") return !!data.name && data.name.trim().length > 0;
      return false;
    },
    { message: "Cada lugar debe tener un nombre (lugar nuevo) o estar asociado a un lugar existente" },
  );

const eventPlaceBaseSchema = z.object({
  data: z
    .object({
      name: z
        .string({ required_error: "El nombre es obligatorio" })
        .min(1, "El nombre no puede estar vacío")
        .max(100, "El nombre no puede exceder 100 caracteres"),
      information: z
        .string({ required_error: "La información es obligatoria" })
        .max(2500, "La información no puede exceder 2500 caracteres"),
      categories: z
        .array(z.string(), { required_error: "Las categorías son obligatorias" })
        .min(1, "Debe seleccionar al menos una categoría"),
      floors: z.array(z.number()).optional().default([]),
      startDate: eventDateSchema,
      endDate: eventDateSchema,
      showFrom: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.showFrom && data.showFrom.length > 0) {
          return data.showFrom < data.startDate;
        }
        return true;
      },
      { message: "La fecha de mostrar desde debe ser anterior a la fecha de inicio", path: ["showFrom"] },
    ),
  locations: z.array(eventLocationSchema).min(1, "Debe agregar al menos un lugar"),
  points: z
    .array(
      z.object({
        geometry: z.object({
          type: z.literal("Point"),
          coordinates: z.array(z.number()).length(2),
        }),
        type: z.literal("Feature"),
        properties: z.object({}),
      }),
    )
    .optional()
    .default([]),
});

export const eventPlaceSchema = eventPlaceBaseSchema;

export const eventPutSchema = eventPlaceBaseSchema.extend({
  identifier: z.string({ required_error: "El identificador es obligatorio" }),
});

export const eventDeleteSchema = z.object({
  identifier: z.string({ required_error: "El identificador es obligatorio" }),
});

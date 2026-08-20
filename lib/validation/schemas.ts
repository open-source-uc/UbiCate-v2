import { z } from "zod";

// Zod 4 eliminó `required_error` e `invalid_type_error` y los unificó en un solo `error`, que puede
// ser un string o un mapa de errores. Este helper reproduce el comportamiento anterior: el mensaje
// en español se usa solo cuando el campo falta; para un tipo equivocado devuelve undefined y gana
// el mensaje por defecto de Zod. Devolver undefined es válido en el error map de Zod 4.
const required = (message: string) => ({
  error: (issue: { input: unknown }) => (issue.input === undefined ? message : undefined),
});

// Esquema de validación común para POST y PUT
export const placeSchema = z.object({
  data: z.object({
    name: z
      .string(required("El nombre es obligatorio"))
      .min(1, "El nombre no puede estar vacío")
      .max(100, "El nombre no puede exceder 100 caracteres"),
    information: z
      .string(required("La información es obligatoria"))
      .max(2500, "La información no puede exceder 2500 caracteres"),
    categories: z
      .array(z.string(), required("Las categorías son obligatorias"))
      .min(1, "Debe seleccionar al menos una categoría"),
    floors: z.array(z.number(), required("Los pisos son obligatorios")).optional().default([]),
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
    required("Los puntos son obligatorios"),
  ),
});

export const putSchema = placeSchema.extend({
  identifier: z.string(required("El identificador es obligatorio")),
});

export const deleteSchema = z.object({
  identifier: z.string(required("El identificador es obligatorio")),
  source: z.enum(["approved", "pending"], {
    error: (issue) =>
      issue.input === undefined ? "El origen es obligatorio" : "El origen debe ser 'approved' o 'pending'",
  }),
});

export const patchSchema = z.object({
  identifier: z.string(required("El identificador es obligatorio")),
  action: z.enum(["approve", "reject"], {
    error: (issue) =>
      issue.input === undefined ? "La acción es obligatoria" : "La acción debe ser 'approve' o 'reject'",
  }),
});

// Schemas para rutas
export const routeSchema = z.object({
  data: z.object({
    name: z
      .string(required("El nombre es obligatorio"))
      .min(1, "El nombre no puede estar vacío")
      .max(100, "El nombre no puede exceder 100 caracteres"),
    information: z
      .string(required("La descripción es obligatoria"))
      .max(2500, "La descripción no puede exceder 2500 caracteres"),
    campus: z.string(required("El campus es obligatorio")).min(1, "Debes elegir un campus"),
    placeIds: z.array(z.string()).optional().default([]),
    // El color es opcional: sin él la ruta se dibuja con el verde por defecto. Se acepta el string
    // vacío para que el formulario pueda mandar "sin color" sin tener que omitir la clave.
    color: z
      .union([
        z.string().regex(/^#[0-9a-fA-F]{6}$/, "El color debe ser un hexadecimal de 6 dígitos, como #22C55E"),
        z.literal(""),
      ])
      .optional(),
  }),
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
      required("Los puntos son obligatorios"),
    )
    .min(2, "La ruta debe tener al menos 2 puntos"),
});

export const routePutSchema = routeSchema.extend({
  identifier: z.string(required("El identificador es obligatorio")),
});

export const routeDeleteSchema = z.object({
  identifier: z.string(required("El identificador es obligatorio")),
});

// Schemas para eventos
const eventDateSchema = z.string(required("La fecha es obligatoria")).min(1, "La fecha no puede estar vacía");

const eventLocationSchema = z
  .object({
    type: z.enum(["existing", "new"]),
    placeId: z.string().optional(),
    name: z.string().optional(),
    information: z.string().max(2500).optional(),
    identifier: z.string().optional(),
    floor: z.number().int("El piso debe ser un número entero").optional(),
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
        .string(required("El nombre es obligatorio"))
        .min(1, "El nombre no puede estar vacío")
        .max(100, "El nombre no puede exceder 100 caracteres"),
      information: z
        .string(required("La información es obligatoria"))
        .max(2500, "La información no puede exceder 2500 caracteres"),
      categories: z
        .array(z.string(), required("Las categorías son obligatorias"))
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
  identifier: z.string(required("El identificador es obligatorio")),
});

export const eventDeleteSchema = z.object({
  identifier: z.string(required("El identificador es obligatorio")),
});

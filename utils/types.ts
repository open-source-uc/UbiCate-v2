interface PointGeometry {
  type: "Point";
  coordinates: [number, number];
}

interface PolygonGeometry {
  type: "Polygon";
  coordinates: [number, number][][];
}

export interface Feature {
  type: string;
  properties: {
    identifier: string;
    name: string;
    information: string;
    categories: string[];
    campus: string;
    faculties?: string;
    floors?: number[];
    needApproval?: boolean;
  };
  geometry: PointGeometry | PolygonGeometry;
}

export interface PointFeature {
  type: string;
  properties: {
    identifier: string;
    name: string;
    information: string;
    categories: string[];
    campus: string;
    faculties?: string;
    floors?: number[];
    needApproval?: boolean;
  };
  geometry: PointGeometry;
}

export interface PolygonFeature {
  type: string;
  properties: {
    identifier: string;
    name: string;
    information: string;
    categories: string[];
    campus: string;
    faculties?: string;
    floors?: number[];
    needApproval?: boolean;
  };
  geometry: PolygonGeometry;
}

export interface JSONFeatures {
  type: string;
  features: Feature[];
}

export const siglas = new Map<string, string>([
  ["SanJoaquin", "SJ"],
  ["LoContador", "LC"],
  ["Villarrica", "VR"],
  ["CasaCentral", "CC"],
  ["Oriente", "OR"],
  ["SJ", "San Joaquin"],
  ["LC", "Lo Contador"],
  ["VR", "Villarrica"],
  ["CC", "Casa Central"],
  ["OR", "Oriente"],
  ["classroom", "Sala"],
  ["bath", "Baño"],
  ["food_lunch", "Comida"],
  ["studyroom", "Sala de estudio"],
  ["library", "Biblioteca"],
  ["trash", "Reciclaje"],
  ["park_bicycle", "Bicicletero"],
  ["financial", "Banco / Cajero automático"],
  ["laboratory", "Laboratorio"],
  ["water", "Punto de agua"],
  ["auditorium", "Auditorio"],
  ["sports_place", "Deporte"],
  ["computers", "Sala de computadores"],
  ["photocopy", "Fotocopias / Impresoras"],
  ["shop", "Tienda"],
  ["parking", "Estacionamiento"],
  ["faculty", "Facultad"],
  ["building", "Edificio"],
  ["other", "Otro"],
  ["bienvenida_novata", "Bienvenida Novata 2025"],
]);

export enum METHOD {
  CREATE = "create",
  UPDATE = "update",
}

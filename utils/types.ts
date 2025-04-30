
export interface PointGeometry {
  type: "Point";
  coordinates: [number, number];
}

interface PolygonGeometry {
  type: "Polygon";
  coordinates: [number, number][][];
}

interface LineGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

export type SubSidebarType = "buscar" | "campus" | "guías" | "placeInformation" | null;

export enum CATEGORIES {
  AUDITORIUM = "auditorium",
  BATH = "bath",
  BUILDING = "building",
  CAMPUS = "campus",
  CLASSROOM = "classroom",
  COMPUTERS = "computers",
  CUSTOM_MARK = "customMark",
  FACULTY = "faculty",
  FINANCIAL = "financial",
  FOOD_LUNCH = "food_lunch",
  LABORATORY = "laboratory",
  LIBRARY = "library",
  OTHER = "other",
  PARK_BICYCLE = "park_bicycle",
  PARKING = "parking",
  PHOTOCOPY = "photocopy",
  SHOP = "shop",
  SPORTS_PLACE = "sports_place",
  STUDYROOM = "studyroom",
  TRASH = "trash",
  WATER = "water",
  USER_LOCATION = "user",
  YARD = "yard"
}


export interface Properties {
  identifier: string;
  name: string;
  information: string;
  categories: string[];
  campus: string;
  faculties?: string[];
  floors?: number[];
  needApproval: boolean;
}

export interface Feature {
  type: string;
  properties: Properties;
  geometry: PointGeometry | PolygonGeometry;
}

export interface LineFeature {
  type: string;
  properties: {};
  geometry: LineGeometry;
}

export interface PointFeature {
  type: string;
  properties: Properties;
  geometry: PointGeometry;
}

export interface PolygonFeature {
  type: string;
  properties: Properties;
  geometry: PolygonGeometry;
}

export interface JSONFeatures {
  type: string;
  features: Feature[];
}

/*
NO USAR PARA CATEGORIAS, EN ESE CASO USAR EL ENUM
NO SE BORRAN AUN PUES ALGO SE PUEDE ROMPER

SOLO USAR PARA CAMPUS, NO INTENTEN HACER ENUM DE CAMPUS YA ES MUY TARDE, EN EL JSON ESTA SJ y SanJoaquin
*/
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
  ["event", "Evento"],
]);

export const CategoryToDisplayName: Map<CATEGORIES, string> = new Map([
  [CATEGORIES.CLASSROOM, "Sala"],
  [CATEGORIES.BATH, "Baño"],
  [CATEGORIES.FOOD_LUNCH, "Comida"],
  [CATEGORIES.STUDYROOM, "Sala de estudio"],
  [CATEGORIES.LIBRARY, "Biblioteca"],
  [CATEGORIES.TRASH, "Reciclaje"],
  [CATEGORIES.PARK_BICYCLE, "Bicicletero"],
  [CATEGORIES.FINANCIAL, "Banco / Cajero automático"],
  [CATEGORIES.LABORATORY, "Laboratorio"],
  [CATEGORIES.WATER, "Punto de agua"],
  [CATEGORIES.AUDITORIUM, "Auditorio"],
  [CATEGORIES.SPORTS_PLACE, "Deporte"],
  [CATEGORIES.COMPUTERS, "Sala de computadores"],
  [CATEGORIES.PHOTOCOPY, "Fotocopias / Impresoras"],
  [CATEGORIES.SHOP, "Tienda"],
  [CATEGORIES.PARKING, "Estacionamiento"],
  [CATEGORIES.FACULTY, "Facultad"],
  [CATEGORIES.BUILDING, "Edificio"],
  [CATEGORIES.OTHER, "Otro"],
  [CATEGORIES.CUSTOM_MARK, "Marcador"],
  [CATEGORIES.YARD, "Patio"],
]);

// Existe pues hay categorias que no deben ser opciones en los formularios, como CUSTOM_MARK
export const CategoryOptions = [
  CATEGORIES.CLASSROOM,
  CATEGORIES.BATH,
  CATEGORIES.FOOD_LUNCH,
  CATEGORIES.STUDYROOM,
  CATEGORIES.LIBRARY,
  CATEGORIES.TRASH,
  CATEGORIES.PARK_BICYCLE,
  CATEGORIES.FINANCIAL,
  CATEGORIES.LABORATORY,
  CATEGORIES.WATER,
  CATEGORIES.AUDITORIUM,
  CATEGORIES.SPORTS_PLACE,
  CATEGORIES.COMPUTERS,
  CATEGORIES.PHOTOCOPY,
  CATEGORIES.SHOP,
  CATEGORIES.PARKING,
  CATEGORIES.FACULTY,
  CATEGORIES.BUILDING,
  CATEGORIES.YARD,
  CATEGORIES.OTHER,
]

export function getDisplayNameForCategory(category: CATEGORIES): string {
  return CategoryToDisplayName.get(category) || "Otro"; // Default display name
}

export enum METHOD {
  CREATE = "create",
  UPDATE = "update",
}

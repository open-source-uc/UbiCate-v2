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

export type SubSidebarType = "temas" | "buscar" | "campus" | "guías" | "placeInformation" | null;

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
  YARD = "yard",
  CRISOL = "crisol",
}

export interface Properties {
  identifier: string;
  name: string;
  information: string;
  categories: string[];
  campus: string;
  faculties: string[];
  floors?: number[];
  needApproval?: boolean;
  // needApproval es solo para saber si un pin esta en newPlaces.json, si esta en places.json se mostrara igual
  // needApproval sera SIEMPRE undefined en places.json
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
SOLO USAR PARA CAMPUS!!!

NO HAY ENUM DE CAMPUS PUES EN EL PLACES.JSON ESTA SJ junto con SanJoaquin, ETC. HABRIA
QUE LIMPIAR EL PLACES.JSON PARA QUE NO HAYA REPETICIONES, LO QUE MODIFICARIA
LA API DE LUGARES, LOS FORMS DE CREACION/EDICION, Y OTRAS COSAS. ASI QUE MEJOR DEJARLO ASI, PUES DUDO QUE EN 30 AÑOS LA UC CREE UN NUEVO CAMPUS XD
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
  [CATEGORIES.CRISOL, "Crisol"],
]);

// Existe pues hay categorias que no deben ser opciones en los formularios, como CUSTOM_MARK
export const CategoryOptions = [
  CATEGORIES.CLASSROOM,
  CATEGORIES.LABORATORY,
  CATEGORIES.STUDYROOM,
  CATEGORIES.BATH,
  CATEGORIES.FOOD_LUNCH,
  CATEGORIES.WATER,
  CATEGORIES.TRASH,
  CATEGORIES.PARK_BICYCLE,
  CATEGORIES.FACULTY,
  CATEGORIES.FINANCIAL,
  CATEGORIES.AUDITORIUM,
  CATEGORIES.SPORTS_PLACE,
  CATEGORIES.COMPUTERS,
  CATEGORIES.PHOTOCOPY,
  CATEGORIES.SHOP,
  CATEGORIES.PARKING,
  CATEGORIES.BUILDING,
  CATEGORIES.YARD,
  CATEGORIES.LIBRARY,
  CATEGORIES.CRISOL,
  CATEGORIES.OTHER,
];


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

export enum CategoryEnum {
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
  USER_LOCATION = "user"
}


export interface Properties {
  identifier: string;
  name: string;
  information: string;
  categories: string[];
  campus: string;
  faculties?: string;
  floors?: number[];
  needApproval?: boolean;
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

export const CategoryToDisplayName: Map<CategoryEnum, string> = new Map([
  [CategoryEnum.CLASSROOM, "Sala"],
  [CategoryEnum.BATH, "Baño"],
  [CategoryEnum.FOOD_LUNCH, "Comida"],
  [CategoryEnum.STUDYROOM, "Sala de estudio"],
  [CategoryEnum.LIBRARY, "Biblioteca"],
  [CategoryEnum.TRASH, "Reciclaje"],
  [CategoryEnum.PARK_BICYCLE, "Bicicletero"],
  [CategoryEnum.FINANCIAL, "Banco / Cajero automático"],
  [CategoryEnum.LABORATORY, "Laboratorio"],
  [CategoryEnum.WATER, "Punto de agua"],
  [CategoryEnum.AUDITORIUM, "Auditorio"],
  [CategoryEnum.SPORTS_PLACE, "Deporte"],
  [CategoryEnum.COMPUTERS, "Sala de computadores"],
  [CategoryEnum.PHOTOCOPY, "Fotocopias / Impresoras"],
  [CategoryEnum.SHOP, "Tienda"],
  [CategoryEnum.PARKING, "Estacionamiento"],
  [CategoryEnum.FACULTY, "Facultad"],
  [CategoryEnum.BUILDING, "Edificio"],
  [CategoryEnum.OTHER, "Otro"],
  [CategoryEnum.CUSTOM_MARK, "Marcador"]
]);

export const CategoryOptions = [
  CategoryEnum.CLASSROOM,
  CategoryEnum.BATH,
  CategoryEnum.FOOD_LUNCH,
  CategoryEnum.STUDYROOM,
  CategoryEnum.LIBRARY,
  CategoryEnum.TRASH,
  CategoryEnum.PARK_BICYCLE,
  CategoryEnum.FINANCIAL,
  CategoryEnum.LABORATORY,
  CategoryEnum.WATER,
  CategoryEnum.AUDITORIUM,
  CategoryEnum.SPORTS_PLACE,
  CategoryEnum.COMPUTERS,
  CategoryEnum.PHOTOCOPY,
  CategoryEnum.SHOP,
  CategoryEnum.PARKING,
  CategoryEnum.FACULTY,
  CategoryEnum.BUILDING,
  CategoryEnum.OTHER,
]

export function getDisplayNameForCategory(category: CategoryEnum): string {
  return CategoryToDisplayName.get(category) || "Otro"; // Default display name
}

export enum METHOD {
  CREATE = "create",
  UPDATE = "update",
}

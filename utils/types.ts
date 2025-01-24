export interface Feature {
  type: string;
  properties: {
    identifier: string;
    name: string;
    information: string;
    categories: string[];
    campus: string;
    faculties: string;
    floors: number[];
    needApproval?: boolean;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export interface Area {
  type: string;
  properties: {
    identifier: string;
    name: string;
    information: string;
    categories: string[];
    campus: string;
    needApproval?: boolean;
  };
  geometry: {
    type: string;
    coordinates: [number, number][][];
  };
}


export interface JSONFeatures {
  type: string;
  features: (Area | Feature)[];
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
  ["other", "Otro"],
]);

export enum METHOD {
  CREATE = "create",
  UPDATE = "update",
}

import React from "react";

interface PointGeometry {
  type: "Point";
  coordinates: [number, number];
}

interface PolygonGeometry {
  type: "Polygon";
  coordinates: [number, number][][];
}

export type SubSidebarType = "buscar" | "campus" | "guías" | "menuInformation" | null;

export type Category = 'auditorium' |
  'bath' |
  'building' |
  'campus' |
  'classroom' |
  'computers' |
  'faculty' |
  'financial' |
  'food_lunch' |
  'laboratory' |
  'library' |
  'other' |
  'park_bicycle' |
  'parking' |
  'photocopy' |
  'shop' |
  'sports_place' |
  'studyroom' |
  'trash' |
  'auditorium' |
  'customMark' |
  'water';

export const CategoryToIcon: Map<Category, React.ReactNode> = new Map([
  ["bath", "wc"],
  ["computers", "print"],
  ["food_lunch", "restaurant"],
  ["library", "library"],
  ["parking", "parking"],
  ["photocopy", "print"],
  ["sports_place", "sport"],
  ["studyroom", "studyroom"],
  ["water", "localDrink"],
  ["auditorium", "auditorium"],
  ["customMark", "pin"]
]);

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

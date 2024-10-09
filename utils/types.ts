export interface Feature {
    type: "Feature";
    properties: {
        identifier: string;
        name: string;
        information: string;
        categories: string[];
        campus: string;
        faculties: string;
        floors: number[];
    };
    geometry: {
        type: "Point";
        coordinates: [number, number];
    };
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
    ["park_bicycle", "Bicicletero"],
    ["studyroom", "Sala de estudio"],
    ["cash_machine", "Banco / Cajero automático"],
    ["other", "Otro"]
]);
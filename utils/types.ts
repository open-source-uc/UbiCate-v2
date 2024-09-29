export interface Feature {
    type: "Feature";
    properties: {
        identifier: string;
        name: string;
        information: string;
        categories: string;
        campus: string;
        faculties: string;
        floor: number;
        category: string;
    };
    geometry: {
        type: "Point";
        coordinates: [number, number];
    };
}
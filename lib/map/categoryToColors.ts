import { CATEGORIES } from "@/lib/types";

const categoryToColorMap = new Map<CATEGORIES, string>([
  [CATEGORIES.FACULTY, "bg-chart-3"], // Facultades - #0176DE
  [CATEGORIES.CLASSROOM, "bg-chart-1"], // Salas de clases - #FEC60D
  [CATEGORIES.STUDYROOM, "bg-chart-15"], // Salas de estudio - #0176DE
  [CATEGORIES.AUDITORIUM, "bg-chart-14"], // Auditorios - #29272B
  [CATEGORIES.BATH, "bg-chart-14"], // Baños - #29272B
  [CATEGORIES.FOOD_LUNCH, "bg-chart-14"], // Comida - #29272B
  [CATEGORIES.WATER, "bg-chart-14"], // Agua - #29272B
  [CATEGORIES.SPORTS_PLACE, "bg-chart-14"], // Deportes - #29272B
  [CATEGORIES.CRISOL, "bg-chart-14"], // Crisol - #29272B
  [CATEGORIES.PARKING, "bg-chart-14"], // Estacionamientos - #29272B
  [CATEGORIES.COMPUTERS, "bg-chart-14"], // Computadores - #29272B
  [CATEGORIES.LIBRARY, "bg-chart-14"], // Bibliotecas - #29272B
  [CATEGORIES.USER_LOCATION, "bg-primary"],
  [CATEGORIES.CUSTOM_MARK, "bg-primary"],
  [CATEGORIES.PHOTOCOPY, "bg-chart-14"], // Fotocopias - #29272B
  [CATEGORIES.FINANCIAL, "bg-chart-14"], // Bancos - #29272B
  [CATEGORIES.SHOP, "bg-chart-14"], // Tiendas - #29272B
  [CATEGORIES.PARK_BICYCLE, "bg-chart-14"], // Bicicleteros - #29272B
  [CATEGORIES.CULTURE, "bg-chart-14"],
  [CATEGORIES.OFFICES, "bg-chart-14"],
  [CATEGORIES.LABORATORY, "bg-chart-14"],
  [CATEGORIES.TRASH, "bg-chart-14"],
]);

export const getCategoryColor = (category: CATEGORIES): string => {
  return categoryToColorMap.get(category) ?? "bg-primary";
};

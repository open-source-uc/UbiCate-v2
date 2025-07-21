import { useMemo } from "react";

import { createMapLibreStyle } from "@/utils/createMapLibreStyle";

import { useTheme } from "../context/themeCtx";

const LIGHT_FORMAL_MAP_COLORS = {
  // Base
  background: "#f5f5f5", // Gris claro en lugar de blanco
  water: "#5ba3d4", // Azul cielo con más contraste
  waterway: "#4a8cc4", // Azul agua más definido

  // Landcover - Tonos naturales con buen contraste
  wood: "#90c695", // Verde bosque más contrastado
  snow: "#e8e8e8", // Gris muy claro para nieve
  grass: "#a8d4a8", // Verde pasto con contraste
  scrub: "#98c498", // Verde matorral diferenciado
  crop: "#b8e4b8", // Verde cultivo más claro

  // Landuse - Grises diferenciados con contraste
  park: "#a8d4a8", // Verde parque contrastado
  residential: "#e0e0e0", // Gris residencial medio
  commercial: "#d0d0d0", // Gris comercial más oscuro
  industrial: "#c0c0c0", // Gris industrial oscuro
  cemetery: "#98c898", // Verde cementerio más definido
  hospital: "#f0c0c0", // Rosa suave pero visible
  school: "#c0d0e0", // Azul gris para escuelas
  airport: "#d8d8d8", // Gris aeropuerto medio
  campus: "#d8d8d0", // Azul gris más definido para campus

  // Building - Gris con buen contraste
  building: "#b0b0b0", // Gris edificio bien contrastado
  buildingOutline: "rgba(120, 120, 120, 0.8)", // Contorno definido

  // Transportation - Grises progresivos con contraste claro
  path: "#c8c8c8", // Sendero gris claro
  minor: "#b8b8b8", // Calle menor gris medio
  secondary: "#a8a8a8", // Secundaria gris
  primary: "#989898", // Primaria gris oscuro
  trunk: "#888888", // Troncal gris más oscuro
  motorway: "#707070", // Autopista gris oscuro
  railStart: "#a8a8a8", // Inicio ferrocarril
  railEnd: "#888888", // Fin ferrocarril más oscuro

  // Text - Textos oscuros con buen contraste
  roadText: "#404040", // Texto carretera gris oscuro
  roadTextHalo: "#f5f5f5", // Halo usando background
  poiText: "#505050", // Texto POI gris oscuro
  poiParkText: "#2d5016", // Texto parque verde oscuro
  poiTextHalo: "#f5f5f5", // Halo POI usando background
  placeText: "#404040", // Texto lugar gris oscuro
  placeTextHalo: "#f5f5f5", // Halo lugar usando background

  // Boundary
  boundary: "#a0a0a0", // Límite gris medio
};

const PINK_COQUETTE_MAP_COLORS = {
  // Base - Rosa coquette más vibrante
  background: "#fce7f3", // Rosa coquette base más saturado
  water: "#a5b4fc", // Azul periwinkle más vibrante
  waterway: "#818cf8", // Azul lavanda más definido

  // Landcover - Verdes más saturados pero armoniosos
  wood: "#bbf7d0", // Verde menta más vibrante
  snow: "#fefefe", // Blanco nieve
  grass: "#c6f6d5", // Verde pasto más definido
  scrub: "#bbf7d0", // Verde matorral más saturado
  crop: "#d1fae5", // Verde cultivo suave

  // Landuse - Campus con verde que contraste bien con rosa
  park: "#a7f3d0", // Verde parque más vibrante
  residential: "#fce7f3", // Rosa residencial coquette
  commercial: "#fbcfe8", // Rosa comercial más visible
  industrial: "#fce7f3", // Rosa industrial coquette
  cemetery: "#d1fae5", // Verde cementerio claro
  hospital: "#fbcfe8", // Rosa hospital más saturado
  school: "#a7f3d0", // Verde escuela vibrante
  airport: "#f3f4f6", // Gris aeropuerto neutro
  campus: "#d1fae5", // Verde campus VIBRANTE para contrastar con rosas - COQUETTE POWER

  // Building - Rosa coquette más saturado pero elegante
  building: "#f9a8d4", // Rosa coquette vibrante - RECOVER THE PINK!
  buildingOutline: "rgba(236, 72, 153, 0.6)", // Contorno rosa más definido

  // Transportation - Progresión de rosas muy suaves
  path: "#f5f5f5", // Sendero gris muy claro
  minor: "#fef7f7", // Calle menor rosa muy suave
  secondary: "#f3e8ff", // Secundaria lavanda suave - MEJORADO
  primary: "#e9d5ff", // Primaria lavanda un poco más visible - MEJORADO
  trunk: "#d8b4fe", // Troncal lavanda medio - MEJORADO
  motorway: "#c084fc", // Autopista lavanda más fuerte - MEJORADO
  railStart: "#f3e8ff", // Inicio ferrocarril - MEJORADO
  railEnd: "#e9d5ff", // Fin ferrocarril - MEJORADO

  // Text - Contraste mejorado
  roadText: "#525252", // Texto carretera gris medio
  roadTextHalo: "#fdf2f8", // Halo rosa muy claro
  poiText: "#404040", // Texto POI gris
  poiParkText: "#166534", // Texto parque verde oscuro
  poiTextHalo: "#fdf2f8", // Halo POI rosa muy claro
  placeText: "#525252", // Texto lugar gris medio
  placeTextHalo: "#fdf2f8", // Halo lugar rosa muy claro
  buildingText: "#6b21a8", // Texto edificios púrpura oscuro - NUEVO para mejor contraste
  campusText: "#14532d", // Texto campus verde muy oscuro - NUEVO

  // Boundary - Lavanda muy discreto
  boundary: "#f3e8ff", // Límite lavanda muy suave - MEJORADO
};

export function useMapStyle() {
  const { theme } = useTheme();

  const mapStyle = useMemo(() => {
    switch (theme) {
      case "light-formal":
        return createMapLibreStyle(LIGHT_FORMAL_MAP_COLORS);
      case "pink-coquette":
        return createMapLibreStyle(PINK_COQUETTE_MAP_COLORS);
      default:
        return createMapLibreStyle(); // Estilo predeterminado
    }
  }, [theme]); // Solo recalcula si cambia el `theme`

  return { mapStyle };
}

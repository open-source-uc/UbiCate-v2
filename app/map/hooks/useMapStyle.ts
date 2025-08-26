import { useMemo } from "react";

import { useTheme } from "@/app/context/themeCtx";
import { createMapLibreStyle } from "@/utils/createMapLibreStyle";

import * as lightFormal from "./config/lightFormal";
import * as normal from "./config/normal";
import * as pinkCoquette from "./config/pinkCoquette";
import * as ucLight from "./config/ucLight";

export function useMapStyle() {
  const { theme } = useTheme();

  const config = useMemo(() => {
    switch (theme) {
      case "light-formal":
        return {
          placesTextLayer: lightFormal.placesTextLayer,
          campusBorderLayer: lightFormal.campusBorderLayer,
          sectionStrokeLayer: lightFormal.sectionStrokeLayer,
          sectionAreaLayer: lightFormal.sectionAreaLayer,
          customPolygonStrokeLayer: lightFormal.customPolygonStrokeLayer,
          customPolygonSectionAreaLayer: lightFormal.customPolygonSectionAreaLayer,
          mapStyle: createMapLibreStyle(lightFormal.LIGHT_FORMAL_MAP_COLORS),
        };
      case "pink-coquette":
        return {
          placesTextLayer: pinkCoquette.placesTextLayer,
          campusBorderLayer: pinkCoquette.campusBorderLayer,
          sectionStrokeLayer: pinkCoquette.sectionStrokeLayer,
          sectionAreaLayer: pinkCoquette.sectionAreaLayer,
          customPolygonStrokeLayer: pinkCoquette.customPolygonStrokeLayer,
          customPolygonSectionAreaLayer: pinkCoquette.customPolygonSectionAreaLayer,
          mapStyle: createMapLibreStyle(pinkCoquette.PINK_COQUETTE_MAP_COLORS),
        };
      case "uc-light":
        return {
          placesTextLayer: ucLight.placesTextLayer,
          campusBorderLayer: ucLight.campusBorderLayer,
          sectionStrokeLayer: ucLight.sectionStrokeLayer,
          sectionAreaLayer: ucLight.sectionAreaLayer,
          customPolygonStrokeLayer: ucLight.customPolygonStrokeLayer,
          customPolygonSectionAreaLayer: ucLight.customPolygonSectionAreaLayer,
          mapStyle: createMapLibreStyle(ucLight.UC_LIGHT_MAP_COLORS),
        };
      default:
        return {
          placesTextLayer: normal.placesTextLayer,
          campusBorderLayer: normal.campusBorderLayer,
          sectionStrokeLayer: normal.sectionStrokeLayer,
          sectionAreaLayer: normal.sectionAreaLayer,
          customPolygonStrokeLayer: normal.customPolygonStrokeLayer,
          customPolygonSectionAreaLayer: normal.customPolygonSectionAreaLayer,
          mapStyle: createMapLibreStyle(),
        };
    }
  }, [theme]);
  return config;
}

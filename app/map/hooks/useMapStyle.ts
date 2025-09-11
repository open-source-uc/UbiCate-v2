import { useMemo } from "react";

import { useTheme } from "@/app/context/themeCtx";
import { createMapLibreStyle } from "@/lib/map/createMapLibreStyle";
import { getTheme } from "@/lib/themes";

export function useMapStyle() {
  const { theme } = useTheme();

  const config = useMemo(() => {
    const themeConfig = getTheme(theme);

    if (!themeConfig) {
      // Fallback to default theme if theme not found
      const defaultTheme = getTheme("");
      if (!defaultTheme) {
        throw new Error("Default theme not found in registry");
      }

      return {
        ...defaultTheme.mapConfig,
        mapStyle: createMapLibreStyle(),
      };
    }

    return {
      ...themeConfig.mapConfig,
      mapStyle: createMapLibreStyle(themeConfig.mapConfig.mapColors),
    };
  }, [theme]);

  return config;
}

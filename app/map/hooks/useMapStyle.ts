import { useMemo } from "react";

import { useTheme } from "@/app/context/themeCtx";
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
      };
    }

    return {
      ...themeConfig.mapConfig,
    };
  }, [theme]);

  return config;
}

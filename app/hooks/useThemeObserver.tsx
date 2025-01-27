import { useCallback, useEffect, useRef, useState } from "react";

import mapboxgl from "mapbox-gl";

export const useThemeObserver = (map: mapboxgl.Map | undefined) => {
  const [theme, setTheme] = useState(
    typeof window !== "undefined" && localStorage?.theme === "dark" ? "dark-v11" : "streets-v12",
  );

  const observer = useRef<MutationObserver | null>(null);

  const onClassChange = useCallback(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark-v11" : "streets-v12");
      map?.setStyle(`mapbox://styles/mapbox/${isDark ? "dark-v11" : "streets-v12"}?optimize=true`);
    }
  }, [map, setTheme]);

  useEffect(() => {
    observer.current = new MutationObserver(onClassChange);
    observer.current.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.current?.disconnect();
    };
  }, [onClassChange]);

  return [theme];
};

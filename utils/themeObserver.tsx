import { useCallback, useEffect, useRef } from "react";

import mapboxgl from "mapbox-gl";

export const useThemeObserver = (setTheme: (theme: string) => void, map: mapboxgl.Map | undefined) => {
  const observer = useRef<MutationObserver | null>(null);

  const onClassChange = useCallback(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark-v11" : "streets-v11");
      map?.setStyle(`mapbox://styles/mapbox/${isDark ? "dark-v11" : "streets-v11"}?optimize=true`);
    }
  }, [map, setTheme]);

  useEffect(() => {
    observer.current = new MutationObserver(onClassChange);
    observer.current.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.current?.disconnect();
    };
  }, [onClassChange]);
};

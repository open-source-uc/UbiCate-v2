// themeObserver.ts
import { useCallback, useEffect, useRef } from "react";

export const useThemeObserver = (onThemeChange: (isDark: boolean) => void) => {
  const observer = useRef<MutationObserver | null>(null);

  const onClassChange = useCallback(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      onThemeChange(isDark);
    }
  }, [onThemeChange]);

  useEffect(() => {
    observer.current = new MutationObserver(onClassChange);
    observer.current.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.current?.disconnect();
    };
  }, [onClassChange]);
};

"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";

interface AppLoadingContextType {
  isMapLoaded: boolean;
  setMapLoaded: () => void;
}

const AppLoadingContext = createContext<AppLoadingContextType>({
  isMapLoaded: false,
  setMapLoaded: () => {},
});

export function AppLoadingProvider({ children }: { children: ReactNode }) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const setMapLoaded = useCallback(() => setIsMapLoaded(true), []);

  return <AppLoadingContext.Provider value={{ isMapLoaded, setMapLoaded }}>{children}</AppLoadingContext.Provider>;
}

export const useAppLoading = () => useContext(AppLoadingContext);

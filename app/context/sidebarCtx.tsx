"use client";
import { getCampusFromUserLocation } from "@/utils/getCampusBounds";
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import useUpdateRoute from "@/utils/useUpdateRoute";
// Define la interfaz extendida
interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  hasLoadedCampus: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasLoadedCampus, setHasLoadedCampus] = useState<boolean>(false);
  const updateParams = useUpdateRoute()

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const loadCampus = async () => {
      if (hasLoadedCampus) return; // Evita cargar más de una vez

      const campus = await getCampusFromUserLocation();
      if (!campus) return;

      updateParams({ campus }, "/map");
      setHasLoadedCampus(true);
    };

    loadCampus();
  }, [hasLoadedCampus]); // Solo se ejecuta si `hasLoadedCampus` cambia

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, hasLoadedCampus }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

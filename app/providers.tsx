"use client";
import React, { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppLoadingProvider } from "./context/appLoadingCtx";
import { DirectionsProvider } from "./context/directionsCtx";
import { MapPickingProvider } from "./context/mapPickingCtx";
import { NotificationProvider } from "./context/notificationCtx";
import { PinsProvider } from "./context/pinsCtx";
import { SidebarProvider } from "./context/sidebarCtx";
import { ThemeProvider } from "./context/themeCtx";
import { UbicationProvider } from "./context/ubicationCtx";
import { usePreloadIconFont } from "./hooks/usePreloadIconFont";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // Se dispara acá y no en el modo edición: para cuando el usuario entra, la fuente ya está lista.
  // El chunk de markdown lo precarga `LoadingScreen`, porque además la portada espera por él.
  usePreloadIconFont();

  // eslint-disable-next-line
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppLoadingProvider>
        <UbicationProvider>
          <SidebarProvider>
            <DirectionsProvider>
              <PinsProvider>
                <MapPickingProvider>
                  <NotificationProvider>
                    <ThemeProvider>{children}</ThemeProvider>
                  </NotificationProvider>
                </MapPickingProvider>
              </PinsProvider>
            </DirectionsProvider>
          </SidebarProvider>
        </UbicationProvider>
      </AppLoadingProvider>
    </QueryClientProvider>
  );
}

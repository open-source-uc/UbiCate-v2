"use client";
import React, { useMemo } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DirectionsProvider } from "./context/directionsCtx";
import { NotificationProvider } from "./context/notificationCtx";
import { PinsProvider } from "./context/pinsCtx";
import { SidebarProvider } from "./context/sidebarCtx";
import { ThemeProvider } from "./context/themeCtx";
import { UbicationProvider } from "./context/ubicationCtx";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const queryClient = useMemo(() => makeQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UbicationProvider>
          <SidebarProvider>
            <DirectionsProvider>
              <PinsProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </PinsProvider>
            </DirectionsProvider>
          </SidebarProvider>
        </UbicationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

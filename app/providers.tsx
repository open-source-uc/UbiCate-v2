"use client";
import React, { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DirectionsProvider } from "./context/directionsCtx";
import { NotificationProvider } from "./context/notificationCtx";
import { PinsProvider } from "./context/pinsCtx";
import { SidebarProvider } from "./context/sidebarCtx";
import { ThemeProvider } from "./context/themeCtx";
import { UbicationProvider } from "./context/ubicationCtx";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
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

  if (!queryClient) {
    return (
      <div>
        Oh no esto no debería pasar D: POR FAVOR REPORTA ESTO AL IG: @opensource_euc, QueryClient is not initialized
      </div>
    );
  }

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

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

  return (
    <QueryClientProvider client={undefined as unknown as QueryClient}>
      <UbicationProvider>
        <SidebarProvider>
          <DirectionsProvider>
            <PinsProvider>
              <NotificationProvider>
                <ThemeProvider>{children}</ThemeProvider>
              </NotificationProvider>
            </PinsProvider>
          </DirectionsProvider>
        </SidebarProvider>
      </UbicationProvider>
    </QueryClientProvider>
  );
}

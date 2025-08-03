"use client";

import React from "react";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DirectionsProvider } from "./context/directionsCtx";
import { NotificationProvider } from "./context/notificationCtx";
import { PinsProvider } from "./context/pinsCtx";
import { SidebarProvider } from "./context/sidebarCtx";
import { ThemeProvider } from "./context/themeCtx";
import { UbicationProvider } from "./context/ubicationCtx";

class UbicationErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("UbicationProvider error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI - render children without UbicationProvider
      return this.props.children;
    }

    return <UbicationProvider>{this.props.children}</UbicationProvider>;
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <UbicationErrorBoundary>
        <SidebarProvider>
          <DirectionsProvider>
            <PinsProvider>
              <NotificationProvider>
                <ThemeProvider>{children}</ThemeProvider>
              </NotificationProvider>
            </PinsProvider>
          </DirectionsProvider>
        </SidebarProvider>
      </UbicationErrorBoundary>
    </QueryClientProvider>
  );
}

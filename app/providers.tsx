"use client";
import React, { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DirectionsProvider } from "./context/directionsCtx";
import { NotificationProvider } from "./context/notificationCtx";
import { PinsProvider } from "./context/pinsCtx";
import { SidebarProvider } from "./context/sidebarCtx";
import { ThemeProvider } from "./context/themeCtx";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>POR FAVOR REPORTA ESTO AL IG: @opensource_euc</h2>
          <p>Algo salió MUY mal D:</p>
          <details style={{ marginTop: "10px", textAlign: "left" }}>
            <summary>Detalles del error</summary>
            <pre style={{ fontSize: "12px", overflow: "auto" }}>
              {this.state.error?.message}
              {"\n"}
              {this.state.error?.stack}
            </pre>
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: "10px", padding: "8px 16px" }}>
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <DirectionsProvider>
            <PinsProvider>
              <NotificationProvider>
                <ThemeProvider>{children}</ThemeProvider>
              </NotificationProvider>
            </PinsProvider>
          </DirectionsProvider>
        </SidebarProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

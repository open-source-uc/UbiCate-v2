"use client";

import type { ErrorInfo } from "react";

import { ErrorBoundary } from "react-error-boundary";

function NullFallback() {
  return null;
}

function logError(error: Error, info: ErrorInfo) {
  console.error("ErrorBoundary capturó un error:", error);
  console.error("Component Stack:", info?.componentStack ?? "(sin stack)");
}

export function SilentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={NullFallback} onError={logError}>
      {children}
    </ErrorBoundary>
  );
}

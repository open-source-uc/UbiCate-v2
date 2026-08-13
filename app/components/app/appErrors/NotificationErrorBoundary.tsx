"use client";

import { use, type ErrorInfo } from "react";

import { ErrorBoundary } from "react-error-boundary";

import DirectionErrorNotification from "@/app/components/features/notifications/ErrorNotification";
import { NotificationContext } from "@/app/context/notificationCtx";

function NullFallback() {
  return null;
}

export function NotificationErrorBoundary({ children }: { children: React.ReactNode }) {
  const { setNotification } = use(NotificationContext);

  function logError(error: unknown, info: ErrorInfo) {
    console.error("ErrorBoundary capturó un error:", error);
    console.error("Component Stack:", info?.componentStack ?? "(sin stack)");
    setNotification(
      <DirectionErrorNotification>
        Error: {error instanceof Error ? error.message : String(error)} - {info?.componentStack}
      </DirectionErrorNotification>,
    );
  }

  return (
    <ErrorBoundary FallbackComponent={NullFallback} onError={logError}>
      {children}
    </ErrorBoundary>
  );
}

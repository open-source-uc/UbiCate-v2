"use client";

import { use, type ErrorInfo } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { NotificationContext } from "@/app/context/notificationCtx";

import DirectionErrorNotification from "../notifications/ErrorNotification";

function NullFallback() {
  return null;
}

export function NotificationErrorBoundary({ children }: { children: React.ReactNode }) {
  const { setNotification } = use(NotificationContext);

  function logError(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary capturó un error:", error);
    console.error("Component Stack:", info?.componentStack ?? "(sin stack)");
    setNotification(
      <DirectionErrorNotification>
        Error: {error?.message} - {info?.componentStack}
      </DirectionErrorNotification>,
    );
  }

  return (
    <ErrorBoundary FallbackComponent={NullFallback} onError={logError}>
      {children}
    </ErrorBoundary>
  );
}

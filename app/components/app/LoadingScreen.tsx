"use client";

import { useSearchParams } from "next/navigation";

import { useEffect, useState } from "react";

import { useAppLoading } from "@/app/context/appLoadingCtx";
import { useSidebar } from "@/app/context/sidebarCtx";
import { useChangelogs } from "@/app/hooks/useChangelogs";
import type { LoadErrorKind } from "@/lib/api/loadError";

import LoadingErrorView from "./LoadingErrorView";
import LoadingScreenView, { FADE_MS } from "./LoadingScreenView";

// Override de prueba: ?testLoadError=first-visit | offline | database
const TEST_LOAD_ERRORS: Record<string, { kind: LoadErrorKind; firstVisit: boolean }> = {
  "first-visit": { kind: "offline", firstVisit: true },
  offline: { kind: "offline", firstVisit: false },
  database: { kind: "database", firstVisit: false },
};

const MIN_VISIBLE_MS = 600;
const MAX_VISIBLE_MS = 8000;

export default function LoadingScreen() {
  const { isMapLoaded } = useAppLoading();
  const { isDataLoaded, loadError, isRetryingLoad, retryLoad } = useSidebar();
  const { isFetched: areChangelogsLoaded } = useChangelogs();
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);

  const testError = TEST_LOAD_ERRORS[useSearchParams().get("testLoadError") ?? ""] ?? null;
  const activeError = testError?.kind ?? loadError;

  const isReady = isMapLoaded && isDataLoaded && areChangelogsLoaded && minTimePassed;
  const isDone = !activeError && (timedOut || isReady);

  useEffect(() => {
    const minTimer = setTimeout(() => setMinTimePassed(true), MIN_VISIBLE_MS);
    const maxTimer = setTimeout(() => setTimedOut(true), MAX_VISIBLE_MS);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  useEffect(() => {
    if (!isDone) return;
    const timer = setTimeout(() => setIsUnmounted(true), FADE_MS);
    return () => clearTimeout(timer);
  }, [isDone]);

  useEffect(() => {
    // Volver a mostrar la portada cuando aparece un error de carga es coordinación con estado de otro árbol, no algo derivable en el render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (activeError) setIsUnmounted(false);
  }, [activeError]);

  if (isUnmounted && !activeError) return null;

  if (activeError)
    return (
      <LoadingErrorView
        kind={activeError}
        isRetrying={isRetryingLoad}
        onRetry={() => retryLoad()}
        forceFirstVisit={testError?.firstVisit}
      />
    );

  return <LoadingScreenView isDone={isDone} />;
}

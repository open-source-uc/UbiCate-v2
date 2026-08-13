"use client";

import { useEffect, useState } from "react";

import { hasAppLoadedOnce, LoadErrorKind } from "@/lib/api/loadError";

import { LoadingScreenShell } from "./LoadingScreenView";

const RETRY_MIN_MS = 3000;

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10" aria-hidden="true">
      <path d="M12 2L1 21h22L12 2zm0 5.5l7.5 12.9h-15L12 7.5zM11 10v5h2v-5h-2zm0 6.5v2h2v-2h-2z" />
    </svg>
  );
}

function OfflineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10" aria-hidden="true">
      <path d="M2.3 3.7l2.2 2.2C3.3 6.6 2.2 7.4 1.2 8.4l2 2c1-1 2.1-1.8 3.4-2.4l2.3 2.3c-1.3.4-2.5 1.1-3.5 2.1l2 2c.9-.9 2-1.5 3.2-1.8l2.6 2.6c-.6.1-1.1.4-1.6.8l3.4 3.4 3.4-3.4-.1-.1 2.4 2.4 1.4-1.4L3.7 2.3 2.3 3.7zm12.4 8.1l2.2 2.2c.5.3.9.7 1.3 1.1l2-2c-1.6-1.6-3.5-2.7-5.5-3.3zM12 4c-1.7 0-3.3.3-4.9.8l2.4 2.4c.8-.1 1.6-.2 2.5-.2 3.5 0 6.8 1.4 9.3 3.8l2-2C20.2 5.7 16.3 4 12 4z" />
    </svg>
  );
}

function getContent(kind: LoadErrorKind, isFirstVisit: boolean) {
  if (kind === "offline") {
    if (isFirstVisit) {
      return {
        icon: <OfflineIcon />,
        title: "Sin conexión a internet",
        message:
          "Esta es tu primera vez conectándote a Ubícate, para descargar la página se requiere de conexión a internet.",
      };
    }
    return {
      icon: <OfflineIcon />,
      title: "Sin conexión a internet",
      message: "No hay conexión y no quedan datos guardados en este dispositivo. Conéctate y vuelve a intentarlo.",
    };
  }

  return {
    icon: <WarningIcon />,
    title: "No pudimos cargar los datos",
    message: "Hubo un error de conexión con la base de datos, vuelve a intentarlo más tarde.",
  };
}

interface LoadingErrorViewProps {
  kind: LoadErrorKind;
  isRetrying?: boolean;
  onRetry: () => void;
  forceFirstVisit?: boolean;
}

export default function LoadingErrorView({
  kind,
  isRetrying = false,
  onRetry,
  forceFirstVisit,
}: LoadingErrorViewProps) {
  // Se lee una sola vez al montar: `markAppLoadedOnce()` puede correr después y voltear el valor,
  // y el copy de la pantalla no debe cambiar a mitad de camino. El inicializador diferido de
  // useState corre solo en el primer render, sin tocar una ref durante el render.
  // Sin setter a propósito: es un valor de solo lectura congelado en el primer render.
  // eslint-disable-next-line react/hook-use-state
  const [storedFirstVisit] = useState(() => !hasAppLoadedOnce());

  const [minRetryActive, setMinRetryActive] = useState(false);
  const { icon, title, message } = getContent(kind, forceFirstVisit ?? storedFirstVisit);

  const isBusy = isRetrying || minRetryActive;

  useEffect(() => {
    if (!minRetryActive) return;
    const timer = setTimeout(() => setMinRetryActive(false), RETRY_MIN_MS);
    return () => clearTimeout(timer);
  }, [minRetryActive]);

  const handleRetry = () => {
    if (isBusy) return;
    setMinRetryActive(true);
    onRetry();
  };

  return (
    <LoadingScreenShell>
      <div role="alert" className="flex max-w-md flex-col items-center text-center text-white">
        <span className="text-white/90">{icon}</span>
        <h1 className="mt-4 text-lg font-semibold drop-shadow-md">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/85 drop-shadow-md">{message}</p>

        <button
          type="button"
          onClick={handleRetry}
          disabled={isBusy}
          aria-busy={isBusy}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-[#0a2559] transition outline-none hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a2559]/25 border-t-[#0a2559]"
            />
          ) : null}
          {isBusy ? "Reintentando…" : "Reintentar"}
        </button>
      </div>
    </LoadingScreenShell>
  );
}

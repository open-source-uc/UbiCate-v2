"use client";

import { useSearchParams } from "next/navigation";

import { useCallback, useEffect, useRef, useState } from "react";

import { useSidebar } from "@/app/context/sidebarCtx";

const BADGE_VISIBLE_MS = 2500;

type BadgeKind = "online" | "offline" | "server";

const BADGE_META: Record<BadgeKind, { text: string; pill: string; dot: string }> = {
  online: { text: "En línea", pill: "bg-emerald-600", dot: "bg-white" },
  offline: { text: "Sin internet", pill: "bg-neutral-700", dot: "bg-neutral-300" },
  server: { text: "Error de conexión con el servidor", pill: "bg-neutral-700", dot: "bg-neutral-300" },
};

// Override de prueba: ?testBadge=online | offline | server
const TEST_BADGES: Record<string, BadgeKind> = {
  online: "online",
  offline: "offline",
  server: "server",
};

const RESULT_TO_BADGE: Record<string, BadgeKind> = {
  ok: "online",
  offline: "offline",
  database: "server",
};

export default function ConnectionBadge() {
  const { firstRequestResult, loadError } = useSidebar();
  const [kind, setKind] = useState<BadgeKind | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const testBadge = TEST_BADGES[useSearchParams().get("testBadge") ?? ""] ?? null;

  const showBadge = useCallback((next: BadgeKind) => {
    setKind(next);
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), BADGE_VISIBLE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!firstRequestResult) return;
    // El badge es transitorio: se muestra y un timer lo esconde. No es estado derivable en el render,
    // es una reacción de una sola vez al resultado del primer request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    showBadge(testBadge ?? RESULT_TO_BADGE[firstRequestResult]);
  }, [firstRequestResult, testBadge, showBadge]);

  useEffect(() => {
    const handleOnline = () => showBadge("online");
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [showBadge]);

  const show = visible && !loadError;
  const meta = kind ? BADGE_META[kind] : null;

  return (
    <div
      aria-live="polite"
      role="status"
      className={`pointer-events-none fixed left-1/2 top-4 z-[2000] max-w-[calc(100vw-2rem)] -translate-x-1/2 transition-all duration-500 ${
        show ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      {meta ? (
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white shadow-lg ${meta.pill}`}
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
          <span className="truncate">{meta.text}</span>
        </div>
      ) : null}
    </div>
  );
}

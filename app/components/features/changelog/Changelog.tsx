"use client";

import { useCallback, useEffect, useState } from "react";

import { useChangelogs } from "@/app/hooks/useChangelogs";
import type { ChangelogChangeType } from "@/lib/changelog/types";

const INITIAL_VISIBLE = 5;
const MODAL_EXIT_MS = 180;

const TYPE_META: Record<ChangelogChangeType, { label: string; className: string }> = {
  new: { label: "Nuevo", className: "bg-emerald-500/15 text-emerald-600" },
  improved: { label: "Mejorado", className: "bg-sky-500/15 text-sky-600" },
  fixed: { label: "Corregido", className: "bg-amber-500/15 text-amber-700" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2zm6 12l.9 2.4L21 17l-2.1.6L18 20l-.9-2.4L15 17l2.1-.6L18 14zM6 15l.7 1.8L9 17l-1.8.7L6 20l-.7-2.3L3 17l2.3-.2L6 15z" />
    </svg>
  );
}

export default function Changelog() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { entries, isLoading, isError } = useChangelogs();

  const visibleEntries = showAll ? entries : entries.slice(0, INITIAL_VISIBLE);
  const canToggle = entries.length > INITIAL_VISIBLE;

  // Se desmonta al terminar la animación de salida, no al hacer click.
  const closeModal = useCallback(() => setClosing(true), []);

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      // El "ver todas" se resetea junto con el cierre, no en un efecto aparte que observe `open`.
      setShowAll(false);
    }, MODAL_EXIT_MS);
    return () => clearTimeout(timer);
  }, [closing]);

  // Cerrar con Escape mientras el modal está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ver novedades"
        className="flex items-center gap-1.5 rounded-lg border border-border bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur transition hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <SparkleIcon />
        Novedades
      </button>

      {open ? (
        <div
          className={`fixed inset-0 z-[1500] flex items-center justify-center bg-black/50 p-4 ${
            closing ? "anim-fade-out" : "anim-fade-in"
          }`}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Novedades"
        >
          <div
            className={`flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-background text-foreground shadow-xl ${
              closing ? "anim-scale-out" : "anim-scale-in"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Novedades</h2>
                <p className="text-xs text-muted-foreground">Historial de cambios de Ubicate</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-secondary hover:text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M18.3 5.71L12 12.01l-6.3-6.3-1.4 1.41 6.29 6.3-6.3 6.29 1.41 1.41 6.3-6.3 6.29 6.3 1.41-1.41-6.3-6.29 6.3-6.3z" />
                </svg>
              </button>
            </div>

            {/* Body scrolleable: cartas de changelog, más reciente arriba */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Cargando novedades…</p>
              ) : isError ? (
                <p className="py-8 text-center text-sm text-destructive">No se pudieron cargar las novedades.</p>
              ) : entries.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Aún no hay novedades.</p>
              ) : (
                <>
                  <ol className="divide-y divide-border">
                    {visibleEntries.map((entry) => (
                      <li key={entry.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {entry.version}
                          </span>
                          <time className="text-xs text-muted-foreground">{formatDate(entry.date)}</time>
                        </div>

                        <h3 className="mt-2 text-sm font-semibold text-foreground">{entry.title}</h3>
                        {entry.description ? (
                          <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
                        ) : null}

                        <ul className="mt-3 space-y-1.5">
                          {entry.changes.map((change, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span
                                className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                  TYPE_META[change.type].className
                                }`}
                              >
                                {TYPE_META[change.type].label}
                              </span>
                              <span className="text-sm text-foreground/90">{change.text}</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>

                  {canToggle ? (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowAll((v) => !v)}
                        aria-expanded={showAll}
                        className="text-sm font-medium text-primary underline underline-offset-4 transition outline-none hover:text-secondary focus:outline-none"
                      >
                        {showAll ? "Mostrar menos" : "Mostrar más"}
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

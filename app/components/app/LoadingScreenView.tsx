import type { ReactNode } from "react";

export const LOADING_IMAGE = "/images/background/loading_screen.jpg";
export const LOADING_IMAGE_MOBILE = "/images/background/loading_screen_mobile.jpg";
export const LOADING_IMAGE_MEDIA = "(min-width: 640px)";
export const LOADING_IMAGE_MOBILE_MEDIA = "(max-width: 639.98px)";
export const FADE_MS = 500;

const BACKDROP = "#0a2559";

export function LoadingScreenShell({ children, isDone = false }: { children: ReactNode; isDone?: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[3000] overflow-hidden transition-opacity ease-out ${
        isDone ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: BACKDROP, transitionDuration: `${FADE_MS}ms` }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-left bg-no-repeat sm:hidden"
        style={{ backgroundImage: `url(${LOADING_IMAGE_MOBILE})` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-cover bg-left bg-no-repeat sm:block"
        style={{ backgroundImage: `url(${LOADING_IMAGE})` }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/25" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">{children}</div>
    </div>
  );
}

export default function LoadingScreenView({ isDone = false }: { isDone?: boolean }) {
  return (
    <LoadingScreenShell isDone={isDone}>
      <div role="status" aria-live="polite" aria-hidden={isDone || undefined} className="flex flex-col items-center">
        <span
          aria-hidden="true"
          className="h-11 w-11 animate-spin rounded-full border-[3px] border-white/25 border-t-white"
        />
        <p className="mt-4 text-center text-lg font-medium text-white drop-shadow-md">Cargando Ubícate UC</p>
      </div>
    </LoadingScreenShell>
  );
}

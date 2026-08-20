/**
 * Enlace absoluto a la app con los parámetros de entrada dados. Se descartan los parámetros con los que
 * se entró: el enlace describe lo que está seleccionado ahora, no cómo se llegó (la app dejó de escribir
 * la selección en la barra de direcciones).
 */
export function buildShareUrl(params: Record<string, string>): string {
  const url = new URL(window.location.href);
  url.search = "";
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/** Diálogo nativo de compartir donde exista; si no, al portapapeles. */
export async function shareLink(url: string): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    if (navigator.share) {
      await navigator.share({ url });
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      console.log("Enlace copiado al portapapeles");
      return;
    }

    console.warn("Las opciones de compartir no están disponibles en este navegador.");
  } catch (error) {
    console.error("Error al compartir:", error);
  }
}

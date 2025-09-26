export function getAllowedOrigin(origin: string | null): string | null {
  if (!origin) return null;

  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase(); // normaliza

    // localhost y 127.0.0.1 siempre permitidos
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return origin; // incluye puerto si viene
    }

    // dominios de producción
    const allowedHostnames = ["osuc.dev", "uc.cl", "ubicate-v2.pages.dev"];

    if (allowedHostnames.includes(hostname) || allowedHostnames.some((h) => hostname.endsWith("." + h))) {
      return origin;
    }
  } catch (error) {
    console.warn("Invalid origin:", origin);
    return null;
  }

  return null;
}

export type LoadErrorKind = "offline" | "database";

export class AppLoadError extends Error {
  readonly kind: LoadErrorKind;

  constructor(kind: LoadErrorKind, message?: string) {
    super(message ?? kind);
    this.name = "AppLoadError";
    this.kind = kind;
  }
}

const HAS_LOADED_ONCE_KEY = "ubicateLoadedOnce";

export function markAppLoadedOnce(): void {
  try {
    localStorage.setItem(HAS_LOADED_ONCE_KEY, "true");
  } catch {
    // localStorage puede estar bloqueado (incógnito / PWA)
  }
}

export function hasAppLoadedOnce(): boolean {
  try {
    return localStorage.getItem(HAS_LOADED_ONCE_KEY) === "true";
  } catch {
    return false;
  }
}

export async function fetchJsonOrThrow<T>(input: string, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(input, init);
  } catch {
    throw new AppLoadError("offline");
  }

  if (!res.ok) throw new AppLoadError("database");

  try {
    return (await res.json()) as T;
  } catch {
    throw new AppLoadError("database");
  }
}

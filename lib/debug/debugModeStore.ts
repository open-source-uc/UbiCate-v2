const KEY = "debugMode";

const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return typeof window !== "undefined" && window.sessionStorage?.getItem(KEY) === "true";
  } catch (error) {
    console.warn("Unable to access sessionStorage:", error);
    return false;
  }
}

export function subscribeDebugMode(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDebugModeSnapshot(): boolean {
  return read();
}

export function getDebugModeServerSnapshot(): boolean {
  return false;
}

export function setDebugModeEnabled(enabled: boolean): void {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      if (enabled) sessionStorage.setItem(KEY, "true");
      else sessionStorage.removeItem(KEY);
    }
  } catch (error) {
    console.warn("Unable to set sessionStorage:", error);
  }
  for (const listener of listeners) listener();
}

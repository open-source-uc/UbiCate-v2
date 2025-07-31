import { useCallback, useRef } from "react";

type TimeoutId = NodeJS.Timeout;
type TimeoutCallback = () => void;

interface UseTimeoutManagerReturn {
  create: (name: string, callback: TimeoutCallback, delay: number) => void;
  cancel: (name: string) => void;
  cancelAll: () => void;
  exists: (name: string) => boolean;
  clear: () => void;
}

/**
 * Hook para manejar múltiples timeouts de forma organizada
 *
 * @example
 * ```tsx
 * const timeouts = useTimeoutManager();
 *
 * // Crear un timeout
 * timeouts.create("mapClick", () => {
 *   console.log("Map clicked!");
 * }, 350);
 *
 * // Cancelar un timeout específico
 * timeouts.cancel("mapClick");
 *
 * // Verificar si existe
 * if (timeouts.exists("mapClick")) {
 *   // hacer algo
 * }
 * ```
 */
export function useTimeoutManager(): UseTimeoutManagerReturn {
  const timeoutsRef = useRef<Map<string, TimeoutId>>(new Map());

  const create = useCallback((name: string, callback: TimeoutCallback, delay: number) => {
    // Cancelar timeout existente con el mismo nombre si existe
    const existingTimeout = timeoutsRef.current.get(name);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Crear nuevo timeout
    const timeoutId = setTimeout(() => {
      // Ejecutar callback
      callback();
      // Limpiar del Map después de ejecutarse
      timeoutsRef.current.delete(name);
    }, delay);

    // Guardar referencia
    timeoutsRef.current.set(name, timeoutId);
  }, []);

  const cancel = useCallback((name: string) => {
    const timeoutId = timeoutsRef.current.get(name);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(name);
    }
  }, []);

  const cancelAll = useCallback(() => {
    timeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    timeoutsRef.current.clear();
  }, []);

  const exists = useCallback((name: string) => {
    return timeoutsRef.current.has(name);
  }, []);

  const clear = useCallback(() => {
    // Alias para cancelAll para mayor claridad semántica
    cancelAll();
  }, [cancelAll]);

  // Cleanup al desmontar el componente
  const cleanup = useCallback(() => {
    timeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    timeoutsRef.current.clear();
  }, []);

  // useEffect para cleanup automático no es necesario aquí
  // porque usamos useRef y el cleanup se hace automáticamente
  // cuando el componente se desmonta (los timeouts se cancelan automáticamente)

  return {
    create,
    cancel,
    cancelAll,
    exists,
    clear,
  };
}

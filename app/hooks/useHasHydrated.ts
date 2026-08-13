"use client";

import { useSyncExternalStore } from "react";

// El store nunca emite: el valor pasa de false a true una sola vez, cuando React deja de hidratar y
// empieza a renderizar en el cliente.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` en el servidor y durante la hidratación, `true` después. Sirve para no renderizar en el
 * primer paso algo que dependa de APIs del navegador, sin copiar la bandera a estado con un
 * `setState` dentro de un `useEffect`.
 */
export function useHasHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

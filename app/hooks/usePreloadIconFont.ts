"use client";

import { useEffect } from "react";

// Ligaduras que usa la toolbar del modo edición (`pickingOverlay.tsx`). Se listan explícitamente para
// que la petición las cubra aunque algún día Google sirva la fuente partida por unicode-range.
const EDIT_MODE_GLYPHS = "distance polyline route undo redo crop_free delete cancel location_on flag";

/**
 * Material Symbols dibuja los iconos con **ligaduras**: hasta que llega el `.woff2`, el navegador tiene
 * en el DOM el nombre del icono como texto (`undo`, `crop_free`…).
 *
 * ⚠️ El `<link rel="stylesheet">` del layout carga temprano, pero eso **solo trae el CSS**: el archivo
 * de la fuente no se descarga hasta que un glifo hace falta de verdad. En móvil el sidebar no muestra
 * ningún Material Symbol, así que el primer glifo aparecía recién al abrir la toolbar del modo edición
 * — y la descarga ocurría justo ahí, a la vista del usuario.
 *
 * `document.fonts.load()` fuerza esa descarga al arrancar la app, sin depender de la URL versionada del
 * `.woff2` (que Google rota) ni de renderizar un elemento oculto.
 */
export function usePreloadIconFont(): void {
  useEffect(() => {
    // El shorthand necesita un tamaño válido; cuál sea da igual para la descarga.
    document.fonts?.load('24px "Material Symbols Outlined"', EDIT_MODE_GLYPHS).catch(() => {
      // Si la precarga falla (offline, CDN caído) no se rompe nada: el icono se resuelve igual al
      // renderizarse, solo se pierde la ventaja de tenerlo listo antes.
    });
  }, []);
}

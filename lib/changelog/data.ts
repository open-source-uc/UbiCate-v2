import type { ChangelogEntry } from "./types";

// Ordenados del más reciente al más antiguo (el más nuevo arriba).
const CHANGELOGS: ChangelogEntry[] = [
  {
    id: "v2-0-0",
    version: "v2.0.0",
    date: "2026-07-30",
    title: "Un nuevo Ubícate",
    description: "Ha llegado un nuevo Ubícate, con una fase de cambios por delante y transparencia a sus usuarios.",
    changes: [
      { type: "new", text: "¿Quieres hacer una caminata en la UC? Explora la nueva sección de circuitos." },
      { type: "new", text: "¿Te era difícil proponer lugares? Prueba el nuevo modo edición." },
      { type: "new", text: "Pantalla de carga con mensajes específicos en caso de error al cargar." },
      { type: "new", text: "Desde ahora nuestros usuarios podrán ver las novedades de Ubícate." },
      {
        type: "new",
        text: "Ahora el sistema te hace saber cuando estás sin internet, en línea o si el servidor presenta problemas.",
      },
      { type: "improved", text: "Optimizaciones generales al sistema." },
      { type: "improved", text: "Mejoras visuales." },
      { type: "improved", text: "Actualización a la sección de créditos." },
      { type: "fixed", text: "Solucionado error que no mostraba la dirección de la geolocalización correctamente." },
      { type: "fixed", text: "Geolocalización ahora funciona en dispositivos iOS." },
    ],
  },
];

// Punto único de acceso. Para pasar a BD, reemplazar el cuerpo manteniendo el contrato
// (ChangelogEntry[] de más reciente a más antiguo).
export async function getChangelogs(): Promise<ChangelogEntry[]> {
  return CHANGELOGS;
}

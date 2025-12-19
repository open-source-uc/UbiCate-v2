"use client";

import { useState } from "react";

import * as Icons from "@/app/components/ui/icons/icons";

interface UsageGuideProps {
  onClose: () => void;
}

type AccordionKey = "buscar" | "agregar" | "modificar" | "iphone" | "android";

export default function UsageGuide({ onClose }: UsageGuideProps) {
  const [openAccordion, setOpenAccordion] = useState<AccordionKey | null>(null);

  const toggleAccordion = (key: AccordionKey) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  function AccordionItem({
    title,
    children,
    id,
    index,
  }: {
    title: string;
    children: React.ReactNode;
    id: AccordionKey;
    index: number;
  }) {
    return (
      <div className="rounded-lg bg-[#0176DE] transition">
        <button
          onClick={() => toggleAccordion(id)}
          className="w-full px-4 py-3 flex items-center justify-between transition"
        >
          <span className="font-semibold text-left text-white">{title}</span>
          <Icons.ExpandMore
            className={`w-5 h-5 text-white transition-transform ${openAccordion === id ? "rotate-180" : ""}`}
          />
        </button>
        {openAccordion === id && <div className="px-4 py-3 text-sm space-y-2 text-white">{children}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-bold text-lg text-foreground">Guías de Uso</h3>
            <p className="text-xs text-muted-foreground">Preguntas frecuentes</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-primary flex items-center justify-center rounded-full cursor-pointer group hover:bg-secondary transition"
          aria-label="Cerrar menú"
        >
          <Icons.Close className="w-4 h-4 fill-background group-hover:fill-secondary-foreground" />
        </button>
      </div>

      {/* Content - Accordions */}
      <section className="flex-1 overflow-auto w-full">
        <div className="space-y-3 p-4">
          <AccordionItem id="buscar" title="¿Cómo buscar un lugar?" index={0}>
            <div className="space-y-2">
              <p>
                Utiliza la barra de búsqueda en la parte superior para encontrar salas, baños, bibliotecas y otros
                puntos de interés.
              </p>
              <p>El mapa se actualizará automáticamente mostrando todos los lugares que coincidan con tu búsqueda.</p>
            </div>
          </AccordionItem>

          <AccordionItem id="agregar" title="¿Cómo agregar un lugar?" index={1}>
            <div className="space-y-2">
              <p>
                Para agregar un lugar nuevo, haz <strong>doble clic</strong> (desktop) o <strong>doble tap</strong>{" "}
                (móvil) en la ubicación del mapa donde deseas agregar el lugar.
              </p>
              <p>Aparecerá un marcador y las coordenadas del lugar y un botón para &quot;Agregar&quot;.</p>
              <p>
                Al hacer clic (Desktop) o tap (Móvil) en &quot;Agregar&quot; se abrirá un formulario donde podrás
                ingresar:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Nombre de la Ubicación</li>
                <li>Categoría (sala, baño, cafetería, etc.)</li>
                <li>Piso (si aplica)</li>
                <li>Descripción (opcional)</li>
              </ul>
              <p>
                Una vez completada la información haz clic en &quot;Crear Ubicación&quot;, el lugar será revisado por
                nuestro equipo antes de ser agregado al Ubicate.
              </p>
            </div>
          </AccordionItem>

          <AccordionItem id="modificar" title="¿Cómo modificar un lugar?" index={2}>
            <div className="space-y-2">
              <p>Selecciona un lugar en el mapa haciendo clic(Desktop) o tap (Móvil) sobre él.</p>
              <p>Se abrirá un panel con la información del lugar y un botón de editar.</p>
              <p>
                Haz clic en <strong>&quot;Editar&quot;</strong> se podrán modificar los detalles del lugar como nombre,
                categoría o descripción.
              </p>
              <p>
                Al darle a &quot;Actualizar&quot; se enviarán los cambios, Los cambios del lugar será revisado por
                nuestro equipo antes de ser actualizados en Ubicate.
              </p>
            </div>
          </AccordionItem>

          <AccordionItem id="iphone" title="¿Cómo agregar Ubicate a tu pantalla de inicio en tu iPhone?" index={3}>
            <div className="space-y-2">
              <p>1. Abre Ubicate en tu navegador de confianza</p>
              <p>2. Haz tap en el ícono de compartir (cuadrado con flecha hacia arriba)</p>
              <p>3. Selecciona &quot;Agregar a pantalla de inicio&quot;</p>
              <p>4. Ingresa un nombre para la aplicación y haz tap en &quot;Agregar al inicio&quot;</p>
              <p>Ahora tendrás Ubicate como una aplicación en tu pantalla de inicio.</p>
            </div>
          </AccordionItem>

          <AccordionItem id="android" title="¿Cómo agregar Ubicate a tu pantalla de inicio en tu Android?" index={4}>
            <div className="space-y-2">
              <p>1. Abre Ubicate en tu navegador de confianza</p>
              <p>2. Haz tap en el menú (tres puntos verticales)</p>
              <p>3. Selecciona &quot;Agregar a pantalla principal&quot;</p>
              <p>4. Confirma la instalación</p>
              <p>
                Ubicate aparecerá ahora como una aplicación en tu pantalla de inicio y podrás acceder a ella fácilmente.
              </p>
            </div>
          </AccordionItem>
        </div>
      </section>
    </div>
  );
}

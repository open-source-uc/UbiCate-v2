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
                Para agregar un lugar nuevo, <strong>presiona dos veces</strong> en la ubicación del mapa donde deseas
                agregar el lugar.
              </p>
              <p>Aparecerá un marcador y las coordenadas del lugar y un botón para <strong>&quot;Agregar&quot;</strong>.</p>
              <p>
                Al presionar ese botón se abrirá un formulario donde podrás ingresar:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Nombre de la Ubicación</li>
                <li>Categoría (sala, baño, cafetería, etc.)</li>
                <li>Piso (si aplica)</li>
                <li>Descripción (opcional)</li>
              </ul>
              <p>
                Una vez completada la información presiona en <strong>&quot;Crear Ubicación&quot;</strong>, el lugar será revisado por
                nuestro equipo antes de ser agregado al Ubicate.
              </p>
            </div>
          </AccordionItem>

          <AccordionItem id="modificar" title="¿Cómo modificar un lugar?" index={2}>
            <div className="space-y-2">
              <p>Selecciona un lugar en el mapa presionando sobre él.</p>
              <p>Se abrirá un panel con la información del lugar.</p>
              <p>
                Presiona en <strong>&quot;Editar&quot;</strong> para modificar los detalles del lugar como nombre,
                categoría o descripción.
              </p>
              <p>
                Al presionar <strong>&quot;Actualizar&quot;</strong> se enviarán los cambios, los cambios del lugar será revisado por
                nuestro equipo antes de ser actualizados en Ubicate.
              </p>
            </div>
          </AccordionItem>

          <AccordionItem id="iphone" title="¿Cómo agregar Ubicate a tu pantalla de inicio en tu iPhone?" index={3}>
            <div className="space-y-2">
              <p>1. Abre Ubicate en tu navegador de confianza</p>
              <p>2. Presiona en el ícono de compartir (cuadrado con flecha hacia arriba)</p>
              <p>3. Selecciona <strong>&quot;Agregar a pantalla de inicio&quot;</strong></p>
              <p>4. Ingresa un nombre para la aplicación y presiona en <strong>&quot;Agregar al inicio&quot;</strong></p>
              <p>Ahora tendrás Ubicate como una aplicación en tu pantalla de inicio.</p>
            </div>
          </AccordionItem>

          <AccordionItem id="android" title="¿Cómo agregar Ubicate a tu pantalla de inicio en tu Android?" index={4}>
            <div className="space-y-2">
              <p>1. Abre Ubicate en tu navegador de confianza</p>
              <p>2. Presiona en el menú (tres puntos verticales)</p>
              <p>3. Selecciona <strong>&quot;Agregar a pantalla principal&quot;</strong></p>
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

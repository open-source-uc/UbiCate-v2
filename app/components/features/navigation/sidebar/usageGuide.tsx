"use client";

import { useState } from "react";

import * as Icons from "@/app/components/ui/icons/icons";

interface UsageGuideProps {
  onClose: () => void;
}

type AccordionKey =
  | "buscar"
  | "agregar"
  | "modificar"
  | "iphone"
  | "android"
  | "iphone_ubicacion"
  | "android_ubicacion";

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

      {/* Content - Accordions (match other tabs: no nested scroll) */}
      <section className="flex-1 px-4 pt-4 pb-8">
        <div className="space-y-3">
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
                Para agregar un nuevo lugar, <strong>presiona dos veces</strong> en el punto del mapa donde deseas
                incorporarlo.
              </p>
              <p>
                Aparecerá un marcador y las coordenadas del lugar y un botón para <strong>&quot;Agregar&quot;</strong>.
              </p>
              <p>Al presionar el botón se abrirá un formulario donde podrás ingresar:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Nombre de la ubicación</li>
                <li>Categoría (sala, baño, cafetería, etc.)</li>
                <li>Piso (si aplica)</li>
                <li>Descripción (opcional)</li>
              </ul>
              <p>
                Una vez completada la información presiona <strong>&quot;Crear Ubicación&quot;</strong>. El lugar será
                revisado por nuestro equipo antes de ser agregado a Ubicate.
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
                Al presionar <strong>&quot;Actualizar&quot;</strong> se enviarán los cambios. Estos serán revisado por
                nuestro equipo antes de ser actualizados en Ubicate.
              </p>
            </div>
          </AccordionItem>
          <AccordionItem id="iphone" title="¿Cómo agregar Ubicate a tu pantalla de inicio en tu iPhone?" index={3}>
            <div className="space-y-2">
              <p>1. Abre Ubicate en tu navegador de confianza</p>
              <p>2. Presiona en el ícono de compartir (cuadrado con flecha hacia arriba)</p>
              <p>
                3. Selecciona <strong>&quot;Agregar a pantalla de inicio&quot;</strong>
              </p>
              <p>
                4. Ingresa un nombre para la aplicación y presiona en <strong>&quot;Agregar al inicio&quot;</strong>
              </p>
              <p>Ahora tendrás Ubicate como una aplicación en tu pantalla de inicio.</p>
            </div>
          </AccordionItem>
          <AccordionItem
            id="iphone_ubicacion"
            title="¿Cómo dar permisos de ubicación a Ubicate en tu iPhone?"
            index={3}
          >
            <div className="space-y-2">
              <p>1. Abre Ubicate en tu navegador de confianza.</p>
              <p>2. Presiona en el botón de geolocalización dentro de la aplicación Ubicate.</p>
              <p>
                3. Cuando se te solicite permiso para acceder a tu ubicación, selecciona{" "}
                <strong>&quot;Permitir siempre&quot;</strong> o{" "}
                <strong>&quot;Permitir mientras visitas el sitio&quot;</strong>, según tu preferencia. (Esto solo ocurre
                la primera vez que accedes a Ubicate)
              </p>
              <p>
                4. Si no ves la solicitud, puedes verificar estos pasos para asegurarte de que tu navegador o
                dispositivo iPhone tenga acceso a tu ubicación:
              </p>
              <p>
                4.1. Asegúrate de que los servicios de ubicación estén habilitados en la configuración de tu dispositivo
                iPhone, generalmente en <strong>&quot;Configuración&quot;</strong> y despues{" "}
                <strong>&quot;Ubicación&quot;</strong>.
              </p>
              <p>
                4.2. En el navegador, ve a el <strong>&quot;Menú de Página&quot;</strong> y despues a{" "}
                <strong>&quot;Configuración del sitio&quot;</strong> y luego a <strong>&quot;Ubicación&quot;</strong>{" "}
                para asegurarte de que Ubicate tenga permiso para acceder a tu ubicación.
              </p>
              <p>Siguiendo estos pasos, Ubicate podrá acceder a tu ubicación y te mostrará tu posición en el mapa.</p>
            </div>
          </AccordionItem>
          <AccordionItem id="android" title="¿Cómo agregar Ubicate a tu pantalla de inicio en tu Android?" index={4}>
            <div className="space-y-2">
              <p>1. Abre Ubicate en tu navegador de confianza</p>
              <p>2. Presiona en el menú (tres puntos verticales)</p>
              <p>
                3. Selecciona <strong>&quot;Agregar a pantalla principal&quot;</strong>
              </p>
              <p>4. Confirma la instalación</p>
              <p>
                Ubicate aparecerá ahora como una aplicación en tu pantalla de inicio y podrás acceder a ella fácilmente.
              </p>
            </div>
          </AccordionItem>
          <AccordionItem
            id="android_ubicacion"
            title="¿Cómo dar permisos de ubicación a Ubicate en tu Android?"
            index={4}
          >
            <div className="space-y-2">
              <p>1. Abre Ubicate en tu navegador de confianza.</p>
              <p>2. Presiona en el botón de geolocalización dentro de la aplicación Ubicate.</p>
              <p>
                3. Cuando se te solicite permiso para acceder a tu ubicación, selecciona{" "}
                <strong>&quot;Permitir esta vez&quot;</strong> o{" "}
                <strong>&quot;Permitir mientras visitas el sitio&quot;</strong>, según tu preferencia. (Esto solo ocurre
                la primera vez que accedes a Ubicate)
              </p>
              <p>
                4. Si no ves la solicitud, puedes verificar estos pasos para asegurarte de que tu navegador o
                dispositivo Android tenga acceso a tu ubicación:
              </p>
              <p>
                4.1. Asegúrate de que los servicios de ubicación estén habilitados en la configuración de tu dispositivo
                Android, generalmente en <strong>&quot;Configuración o Ajustes&quot;</strong> y despues{" "}
                <strong>&quot;Ubicación&quot;</strong>.
              </p>
              <p>
                4.2. Si eso no soluciona el problema, en el navegador, ve a{" "}
                <strong>&quot;Configuración del sitio&quot;</strong> y luego a <strong>&quot;Ubicación&quot;</strong>{" "}
                para asegurarte de que Ubicate tenga permiso para acceder a tu ubicación.
              </p>
              <p>Siguiendo estos pasos, Ubicate podrá acceder a tu ubicación y te mostrará tu posición en el mapa.</p>
            </div>
          </AccordionItem>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

import { CATEGORIES, CategoryToDisplayName, Feature, siglas } from "@/utils/types";

import RouteButton from "../directions/routeButton";
import * as Icons from "../icons/icons";
import MarkDownComponent from "../markDown";

export default function PlaceInformation({
  place,
  onClose,
  onEdit,
  onCreate,
  onDelete,
  onApprove,
  onReject,
}: {
  place: Feature;
  onClose?: () => void;
  onEdit?: () => void;
  onCreate?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const [isDebug, setIsDebug] = useState<boolean>(false);

  // Safely check for debug mode on client side only
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const debugMode = sessionStorage.getItem("debugMode") === "true";
        setIsDebug(debugMode);
      }
    } catch (error) {
      // Storage access might be blocked in incognito mode or PWA
      console.warn("Unable to access sessionStorage:", error);
      setIsDebug(false);
    }
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          url: window.location.href,
        });
        console.log("Contenido compartido con éxito");
      } catch (error) {
        console.error("Error al compartir:", error);
      }
    } else {
      console.warn("La API de compartir no está soportada en este navegador.");
    }
  };

  // Calcular las opciones disponibles
  const isCustomMark = place?.properties.categories.includes(CATEGORIES.CUSTOM_MARK);
  const needsApproval = place.properties.needApproval === true;

  const availableOptions = [];

  if (isCustomMark) {
    availableOptions.push({ action: onCreate, icon: Icons.Edit, label: "Agregar" });
  } else {
    availableOptions.push({ action: onEdit, icon: Icons.Edit, label: "Editar" });
  }

  if (isDebug && !isCustomMark) {
    if (needsApproval) {
      availableOptions.push({ action: onApprove, icon: null, label: "Aprobar" });
      availableOptions.push({ action: onReject, icon: null, label: "Rechazar" });
    } else {
      availableOptions.push({ action: onDelete, icon: null, label: "Eliminar" });
    }
  }

  // Si solo hay una opción, mostrarla como botón independiente
  if (availableOptions.length === 1) {
    const singleOption = availableOptions[0];

    return (
      <div className="px-2 pt-4">
        <section className="space-y-1 flex flex-col pt-2 pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="max-w-[2/3] pr-10">
              <h3 className="font-bold text-xl break-words whitespace-normal">{place.properties.name}</h3>
            </div>

            <button
              className="text-content-primary bg-interactive-accent flex items-center rounded-full hover:text-interactive-accent-foreground hover:bg-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:ring-offset-2"
              aria-label="Cerrar menú"
              onClick={(e) => onClose?.()}
            >
              <Icons.Close />
            </button>
          </div>
          {place.properties?.categories?.[0] ? (
            <div className="font-light text-md mt-1">
              {CategoryToDisplayName.get(place.properties.categories[0] as CATEGORIES) || "Lugar sin categoría"}
            </div>
          ) : null}
        </section>
        <section className="flex space-x-2">
          <button
            onClick={handleShare}
            onKeyDown={(e) => e.key === "Enter" && handleShare}
            aria-label="Comparte esta Ubicación"
            role="navigation"
            tabIndex={0}
            className="p-1 w-full cursor-pointer bg-interactive-primary hover:bg-interactive-accent text-interactive-primary-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:ring-offset-2"
          >
            <div className="flex justify-center items-center w-full h-10">
              <Icons.Share />
            </div>
            <p className="text-xs font-medium">Compartir</p>
          </button>
          {/* Rutas */}
          <RouteButton place={place} />
          {/* Botón único en lugar del dropdown */}
          <button
            onClick={singleOption.action}
            onKeyDown={(e) => e.key === "Enter" && singleOption.action?.()}
            aria-label={singleOption.label}
            role="navigation"
            tabIndex={0}
            className="p-1 w-full cursor-pointer bg-interactive-primary hover:bg-interactive-accent text-interactive-primary-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:ring-offset-2"
          >
            <div className="w-full flex justify-center items-center h-10">
              {singleOption.icon ? <singleOption.icon /> : <Icons.Options />}
            </div>
            <p className="text-xs font-medium">{singleOption.label}</p>
          </button>
        </section>
        <section className="divide-y divide-accent/30">
          {place.properties?.floors && place.properties.floors.length > 0 ? (
            <div className="py-4 px-2 transition-colors duration-200 hover:bg-interactive-accent/5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-interactive-primary">
                  <Icons.Floor className="fill-interactive-primary" />
                  <span className="font-medium text-content-primary">Piso</span>
                </div>
                <span className="text-content-primary font-light">{place.properties.floors.join(", ")}</span>
              </div>
            </div>
          ) : null}

          {place.properties?.campus ? (
            <div className="py-4 px-2 transition-colors duration-200 hover:bg-interactive-accent/5 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-interactive-primary">
                  <Icons.Map className="fill-interactive-primary" />
                  <span className="font-medium text-content-primary">Campus</span>
                </div>
                <span className="text-content-primary font-light">{siglas.get(place.properties.campus)}</span>
              </div>
            </div>
          ) : null}

          {place.properties.information ? (
            <div className="space-y-2 py-4">
              <h3 className="text-xl font-semibold">Descripción</h3>
              <div className="bg-surface rounded-md">
                <MarkDownComponent>{place.properties.information}</MarkDownComponent>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    );
  }

  // Si hay múltiples opciones, mostrar el dropdown como antes
  return (
    <div className="px-2 pt-4">
      <section className="space-y-1 flex flex-col bg-background pt-2 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="max-w-[2/3] pr-10">
            <h3 className="font-bold text-xl break-words whitespace-normal">{place.properties.name}</h3>
          </div>

          <button
            className="text-content-primary bg-interactive-accent flex items-center rounded-full hover:text-interactive-accent-foreground hover:bg-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:ring-offset-2"
            aria-label="Cerrar menú"
            onClick={(e) => onClose?.()}
          >
            <Icons.Close />
          </button>
        </div>
        {place.properties?.categories?.[0] ? (
          <div className="font-light text-md mt-1">
            {CategoryToDisplayName.get(place.properties.categories[0] as CATEGORIES) || "Lugar sin categoría"}
          </div>
        ) : null}
      </section>
      <section className="flex space-x-2">
        <button
          onClick={handleShare}
          onKeyDown={(e) => e.key === "Enter" && handleShare}
          aria-label="Comparte esta Ubicación"
          role="navigation"
          tabIndex={0}
          className="p-1 w-full cursor-pointer bg-interactive-primary hover:bg-interactive-accent text-interactive-primary-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:ring-offset-2"
        >
          <div className="flex justify-center items-center w-full h-10">
            <Icons.Share />
          </div>
          <p className="text-xs font-medium">Compartir</p>
        </button>
        {/* Rutas */}
        <RouteButton place={place} />
        <DropdownMenu>
          <DropdownMenuTrigger
            onKeyDown={(e) => e.key === "Enter" && handleShare}
            aria-label="Comparte esta Ubicación"
            role="navigation"
            tabIndex={0}
            className="p-1 w-full cursor-pointer bg-surface hover:bg-interactive-accent text-content-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:ring-offset-2"
          >
            <div className="w-full flex justify-center items-center">
              <Icons.Options />
            </div>
            <p className="text-xs font-medium">Más</p>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-surface rounded-lg shadow-lg px-2 py-2">
            {availableOptions.map((option, index) => (
              <div key={index}>
                <DropdownMenuItem onClick={option.action} className="flex items-center gap-2">
                  {option.icon ? <option.icon /> : null}
                  <span>{option.label}</span>
                </DropdownMenuItem>
                {index < availableOptions.length - 1 && option.label === "Editar" && <DropdownMenuSeparator />}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
      <section className="divide-y divide-interactive-accent/30">
        {place.properties?.floors && place.properties.floors.length > 0 ? (
          <div className="py-4 px-2 transition-colors duration-200 hover:bg-interactive-accent/5 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-interactive-primary">
                <Icons.Floor className="fill-interactive-primary" />
                <span className="font-medium text-content-primary">Piso</span>
              </div>
              <span className="text-content-primary font-light">{place.properties.floors.join(", ")}</span>
            </div>
          </div>
        ) : null}

        {place.properties?.campus ? (
          <div className="py-4 px-2 transition-colors duration-200 hover:bg-interactive-accent/5 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-interactive-primary">
                <Icons.Map className="fill-interactive-primary" />
                <span className="font-medium text-content-primary">Campus</span>
              </div>
              <span className="text-content-primary font-light">{siglas.get(place.properties.campus)}</span>
            </div>
          </div>
        ) : null}

        {place.properties.information ? (
          <div className="space-y-2 py-4">
            <h3 className="text-xl font-semibold">Descripción</h3>
            <div className="bg-surface rounded-md">
              <MarkDownComponent>{place.properties.information}</MarkDownComponent>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

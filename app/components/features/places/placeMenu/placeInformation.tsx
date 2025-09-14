import { useState, useEffect } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

import { CATEGORIES, CategoryToDisplayName, Feature, siglas } from "@/lib/types";

import * as Icons from "../../../ui/icons/icons";
import MarkDownComponent from "../../../ui/markDown";
import RouteButton from "../../directions/routeButton";

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
      <div className="px-4">
        {/* Header following consistent pattern */}
        <section className="flex items-center justify-between w-full py-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="min-w-0">
              <h3 className="font-bold text-lg text-foreground break-words">{place.properties.name}</h3>
              {place.properties?.categories?.[0] ? (
                <p className="text-sm text-muted-foreground mt-1">
                  {CategoryToDisplayName.get(place.properties.categories[0] as CATEGORIES) || "Lugar sin categoría"}
                </p>
              ) : null}
            </div>
          </div>
          <button
            onClick={(e) => onClose?.()}
            className="w-8 h-8 text-foreground bg-accent flex items-center justify-center rounded-full hover:text-accent hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ml-3 flex-shrink-0"
            aria-label="Cerrar menú"
          >
            <Icons.Close className="w-4 h-4" />
          </button>
        </section>
        {/* Action buttons with consistent styling */}
        <section className="flex space-x-2 px-4 pb-4">
          <button
            onClick={handleShare}
            onKeyDown={(e) => e.key === "Enter" && handleShare}
            aria-label="Comparte esta Ubicación"
            role="navigation"
            tabIndex={0}
            className="p-1 w-full cursor-pointer bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
            className="p-1 w-full cursor-pointer bg-secondary hover:bg-accent text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="w-full flex justify-center items-center h-10">
              {singleOption.icon ? <singleOption.icon /> : <Icons.Options />}
            </div>
            <p className="text-xs font-medium">{singleOption.label}</p>
          </button>
        </section>
        {/* Content area with consistent spacing */}
        <section className="px-4 divide-y divide-accent/30">
          {place.properties?.floors && place.properties.floors.length > 0 ? (
            <div className="py-4 px-2 transition-colors duration-200 hover:bg-accent/5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-primary">
                  <Icons.Floor className="fill-primary" />
                  <span className="font-medium text-foreground">Piso</span>
                </div>
                <span className="text-foreground font-light">{place.properties.floors.join(", ")}</span>
              </div>
            </div>
          ) : null}

          {place.properties?.campus ? (
            <div className="py-4 px-2 transition-colors duration-200 hover:bg-accent/5 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-primary">
                  <Icons.Map className="fill-primary" />
                  <span className="font-medium text-foreground">Campus</span>
                </div>
                <span className="text-foreground font-light">{siglas.get(place.properties.campus)}</span>
              </div>
            </div>
          ) : null}

          {place.properties.information ? (
            <div className="space-y-2 py-4">
              <h3 className="text-xl font-semibold">Descripción</h3>
              <div className="bg-secondary rounded-md">
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
    <div className="px-4">
      {/* Header following consistent pattern */}
      <section className="flex items-center justify-between w-full py-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="min-w-0">
            <h3 className="font-bold text-lg text-foreground break-words">{place.properties.name}</h3>
            {place.properties?.categories?.[0] ? (
              <p className="text-sm text-muted-foreground mt-1">
                {CategoryToDisplayName.get(place.properties.categories[0] as CATEGORIES) || "Lugar sin categoría"}
              </p>
            ) : null}
          </div>
        </div>
        <button
          onClick={(e) => onClose?.()}
          className="w-8 h-8 text-foreground bg-accent flex items-center justify-center rounded-full hover:text-accent hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ml-3 flex-shrink-0"
          aria-label="Cerrar menú"
        >
          <Icons.Close className="w-4 h-4" />
        </button>
      </section>
      {/* Action buttons with consistent styling */}
      <section className="flex space-x-2 px-4 pb-4">
        <button
          onClick={handleShare}
          onKeyDown={(e) => e.key === "Enter" && handleShare}
          aria-label="Comparte esta Ubicación"
          role="navigation"
          tabIndex={0}
          className="p-1 w-full cursor-pointer bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
            className="p-1 w-full cursor-pointer bg-secondary hover:bg-accent text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="w-full flex justify-center items-center">
              <Icons.Options />
            </div>
            <p className="text-xs font-medium">Más</p>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-secondary rounded-lg shadow-lg px-2 py-2">
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
      {/* Content area with consistent spacing */}
      <section className="px-4 divide-y divide-accent/30">
        {place.properties?.floors && place.properties.floors.length > 0 ? (
          <div className="py-4 transition-colors duration-200 hover:bg-accent/5 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-primary">
                <Icons.Floor className="fill-primary" />
                <span className="font-medium text-foreground">Piso</span>
              </div>
              <span className="text-foreground font-light">{place.properties.floors.join(", ")}</span>
            </div>
          </div>
        ) : null}

        {place.properties?.campus ? (
          <div className="py-4 transition-colors duration-200 hover:bg-accent/5 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-primary">
                <Icons.Map className="fill-primary" />
                <span className="font-medium text-foreground">Campus</span>
              </div>
              <span className="text-foreground font-light">{siglas.get(place.properties.campus)}</span>
            </div>
          </div>
        ) : null}

        {place.properties.information ? (
          <div className="space-y-2 py-4">
            <h3 className="text-xl font-semibold">Descripción</h3>
            <div className="bg-secondary rounded-md">
              <MarkDownComponent>{place.properties.information}</MarkDownComponent>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

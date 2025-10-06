import { useState, useEffect, type ElementType } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

import { CATEGORIES, CategoryToDisplayName, Feature, siglas } from "@/lib/types";

import { Button } from "../../../ui/button";
import * as Icons from "../../../ui/icons/icons";
import MarkDownComponent from "../../../ui/markDown";
import RouteButton from "../../directions/routeButton";

import { SidebarLabel } from "./SidebarLabel";

type AvailableOption = {
  action: (() => void) | undefined;
  icon: ElementType | null;
  label: string;
};

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
    if (typeof window === "undefined") return;

    try {
      if (navigator.share) {
        await navigator.share({
          url: window.location.href,
        });
        return;
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href);
        console.log("Enlace copiado al portapapeles");
        return;
      }

      console.warn("Las opciones de compartir no están disponibles en este navegador.");
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  // Calcular las opciones disponibles
  const isCustomMark = place?.properties.categories.includes(CATEGORIES.CUSTOM_MARK);
  const needsApproval = place.properties.needApproval === true;

  const availableOptions: AvailableOption[] = [];

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

  const categoryLabel = place.properties?.categories?.[0]
    ? CategoryToDisplayName.get(place.properties.categories[0] as CATEGORIES) || "Lugar sin categoría"
    : null;
  const campusDisplayName = siglas.get(place.properties.campus) || "UC";
  const campusDescription = place.properties.information;
  const campusAriaLabel = `Campus ${campusDisplayName}`;
  const categoryAriaLabel = categoryLabel ? `Categoría ${categoryLabel}` : undefined;

  const renderInfoRow = (Icon: ElementType, label: string, value: string) => (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-accent/5 px-3 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4 fill-primary" />
        </span>
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium text-muted-foreground text-right">{value}</span>
    </div>
  );

  const renderOptionControl = () => {
    if (availableOptions.length === 1) {
      const singleOption = availableOptions[0];
      const SingleIcon = singleOption.icon;

      return (
        <Button
          onClick={() => singleOption.action?.()}
          aria-label={singleOption.label}
          variant="mapSecondary"
          className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl"
        >
          {SingleIcon ? <SingleIcon className="h-4 w-4" /> : <Icons.Options className="h-4 w-4" />}
          <span className="text-xs font-semibold">{singleOption.label}</span>
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Más opciones para este lugar"
            variant="mapSecondary"
            className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg"
          >
            <Icons.Options className="h-4 w-4" />
            <span className="text-xs font-semibold">Más</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[70] min-w-[12rem] rounded-xl border border-border bg-popover p-2 shadow-xl">
          {availableOptions.map((option, index) => {
            const OptionIcon = option.icon;
            const showSeparator = index < availableOptions.length - 1 && option.label === "Editar";

            return (
              <div key={`${option.label}-${index}`}>
                <DropdownMenuItem
                  onClick={() => option.action?.()}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground focus:bg-accent focus:outline-none"
                >
                  {OptionIcon ? <OptionIcon className="h-4 w-4" /> : null}
                  <span>{option.label}</span>
                </DropdownMenuItem>
                {showSeparator ? <DropdownMenuSeparator className="mx-2 my-1 bg-border" /> : null}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-border px-4 pb-3 pt-4">
        <section className="space-y-3 max-w-[70%]">
          <div>
            <h3 className="text-xl font-bold leading-tight text-foreground">{place.properties.name}</h3>
            <p className="text-xs font-medium text-muted-foreground">Descúbre más sobre este lugar.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SidebarLabel icon={Icons.Map} variant="primary" ariaLabel={campusAriaLabel}>
              {campusDisplayName}
            </SidebarLabel>
            {categoryLabel ? (
              <SidebarLabel icon={Icons.MenuBook} variant="muted" ariaLabel={categoryAriaLabel}>
                {categoryLabel}
              </SidebarLabel>
            ) : null}
          </div>
        </section>

        <button
          onClick={() => onClose?.()}
          className="flex h-8 w-8 items-center text-background justify-center cursor-pointer rounded-full bg-primary text-primary-foreground transition hover:bg-secondary hover:text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Cerrar menú"
        >
          <Icons.Close className="h-4 w-4 fill-background" />
        </button>
      </header>

      <section className="flex-1 overflow-y-auto">
        <div className="flex h-full flex-col gap-6 px-4 pb-6 pt-5">
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleShare}
              aria-label="Compartir esta ubicación"
              variant="mapPrimary"
              className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl"
            >
              <Icons.Share className="h-5 w-5 fill-background" />
              <span className="text-xs font-semibold tracking-wide">Compartir</span>
            </Button>

            {/* <RouteButton place={place} /> */}

            {renderOptionControl()}
          </div>

          <div className="space-y-3">
            {place.properties?.floors && place.properties.floors.length > 0
              ? renderInfoRow(Icons.Floor, "Piso", place.properties.floors.join(", "))
              : null}

            {place.properties?.campus
              ? renderInfoRow(Icons.Map, "Campus", siglas.get(place.properties.campus) ?? place.properties.campus)
              : null}
          </div>

          {place.properties.information ? (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground">Descripción</h4>
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                <MarkDownComponent>{place.properties.information}</MarkDownComponent>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

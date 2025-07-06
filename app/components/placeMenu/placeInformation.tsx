import { useRef } from "react";

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
import { SidebarCloseButton } from "../sidebar/ui";
import { ActionButton, InfoCard } from "../ui";

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
  const isDebug = useRef<boolean>(sessionStorage.getItem("debugMode") === "true");

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

  return (
    <div className="bg-background min-h-full">
      {/* Header Section */}
      <section className="relative px-4 pt-6 pb-4 bg-gradient-to-b from-background to-card border-b border-border/20">
        <div className="flex items-start justify-between w-full">
          <div className="flex-1 pr-4">
            <h1 className="font-bold text-2xl text-foreground leading-tight mb-2 break-words">
              {place.properties.name}
            </h1>
            {place.properties?.categories?.[0] ? (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-sm font-medium text-primary">
                  {CategoryToDisplayName.get(place.properties.categories[0] as CATEGORIES) || "Lugar sin categoría"}
                </span>
              </div>
            ) : null}
          </div>

          <SidebarCloseButton
            onClick={() => onClose?.()}
            ariaLabel="Cerrar información del lugar"
            className="!w-10 !h-10 !p-2 bg-card hover:bg-accent shadow-sm"
          />
        </div>
      </section>
      {/* Action Buttons */}
      <section className="px-4 py-3 bg-card/50 border-b border-border/20">
        <div className="grid grid-cols-3 gap-2">
          <ActionButton
            onClick={handleShare}
            onKeyDown={(e) => e.key === "Enter" && handleShare()}
            ariaLabel="Comparte esta Ubicación"
            icon={<Icons.Share className="w-5 h-5" />}
            label="Compartir"
          />

          <div className="flex flex-col items-center justify-center py-3 px-2">
            <RouteButton place={place} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Más opciones"
              role="button"
              tabIndex={0}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-background hover:bg-accent/10 text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
            >
              <div className="w-8 h-8 mb-2 flex items-center justify-center">
                <Icons.Options className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">Más</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border border-border rounded-xl shadow-lg px-1 py-1 min-w-48">
              {isDebug.current === false && (
                <DropdownMenuItem>
                  {place?.properties.categories.includes(CATEGORIES.CUSTOM_MARK) ? (
                    <DropdownMenuItem
                      onClick={onCreate}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent cursor-pointer"
                    >
                      <span>Agregar</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={onEdit}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent cursor-pointer"
                    >
                      <span>Editar</span>
                      <Icons.Edit className="w-4 h-4" />
                    </DropdownMenuItem>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="my-1 border-t border-border/30" />
              {isDebug.current && place.properties.needApproval === true ? (
                <>
                  <DropdownMenuItem
                    onClick={onEdit}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onApprove}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-green/10 text-green cursor-pointer"
                  >
                    <span>Aprobar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onReject}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red/10 text-red cursor-pointer"
                  >
                    <span>Rechazar</span>
                  </DropdownMenuItem>
                </>
              ) : null}
              {isDebug.current && !place?.properties.categories.includes(CATEGORIES.CUSTOM_MARK) ? (
                <>
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red/10 text-red cursor-pointer"
                  >
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onEdit}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <span>Editar</span>
                  </DropdownMenuItem>
                </>
              ) : null}
              {isDebug.current && place?.properties.categories.includes(CATEGORIES.CUSTOM_MARK) ? (
                <>
                  <DropdownMenuItem
                    onClick={onCreate}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <span>Agregar</span>
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>
      {/* Location Details */}
      <section className="px-4 py-3 space-y-3">
        {place.properties?.floors && place.properties.floors.length > 0 ? (
          <InfoCard
            icon={<Icons.Floor className="w-5 h-5 fill-primary" />}
            title="Piso"
            subtitle="Nivel del edificio"
            value={place.properties.floors.join(", ")}
          />
        ) : null}

        {place.properties?.campus ? (
          <InfoCard
            icon={<Icons.Map className="w-5 h-5 fill-primary" />}
            title="Campus"
            subtitle="Sede universitaria"
            value={siglas.get(place.properties.campus)}
          />
        ) : null}

        {place.properties.information ? (
          <InfoCard icon={<span className="text-primary text-sm">ℹ</span>} title="Descripción">
            <div className="bg-background/50 rounded-lg p-3 border border-border/10">
              <MarkDownComponent>{place.properties.information}</MarkDownComponent>
            </div>
          </InfoCard>
        ) : null}
      </section>
    </div>
  );
}

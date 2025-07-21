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
    <div className="px-2 pt-4">
      <section className="space-y-1 flex flex-col bg-background pt-2 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="max-w-[2/3] pr-10">
            <h3 className="font-bold text-xl break-words whitespace-normal">{place.properties.name}</h3>
          </div>

          <button
            className="text-foreground bg-accent flex items-center rounded-full hover:text-accent hover:bg-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
          className="p-1 w-full cursor-pointer bg-primary hover:bg-accent text-primary-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
            {isDebug.current === false && (
              <DropdownMenuItem>
                {place?.properties.categories.includes(CATEGORIES.CUSTOM_MARK) ? (
                  <DropdownMenuItem onClick={onCreate}>Agregar</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={onEdit}>
                    Editar
                    <Icons.Edit />
                  </DropdownMenuItem>
                )}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {isDebug.current && place.properties.needApproval === true ? (
              <>
                <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
                <DropdownMenuItem onClick={onApprove}>Aprobar</DropdownMenuItem>
                <DropdownMenuItem onClick={onReject}>Rechazar</DropdownMenuItem>
              </>
            ) : null}
            {isDebug.current && !place?.properties.categories.includes(CATEGORIES.CUSTOM_MARK) ? (
              <>
                <DropdownMenuItem onClick={onDelete}>Eliminar</DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
              </>
            ) : null}
            {isDebug.current && place?.properties.categories.includes(CATEGORIES.CUSTOM_MARK) ? (
              <>
                <DropdownMenuItem onClick={onCreate}>Agregar</DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
      <section className="divide-y divide-accent/30">
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

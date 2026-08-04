"use client";

import type { ElementType } from "react";

import { CATEGORIES, CategoryToDisplayName, Feature, siglas } from "@/lib/types";

import { SidebarLabel } from "../components/features/places/placeMenu/SidebarLabel";
import * as Icons from "../components/ui/icons/icons";
import MarkDownComponent from "../components/ui/markDown";

function InfoRow({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
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
}

// Ficha del lugar en modo solo vista: mismo lenguaje visual que el sidebar, sin ningún control.
export default function PlaceViewCard({ place }: { place: Feature }) {
  const categoryLabel = place.properties.categories?.[0]
    ? CategoryToDisplayName.get(place.properties.categories[0] as CATEGORIES) || "Lugar sin categoría"
    : null;
  const campusDisplayName = siglas.get(place.properties.campus) || place.properties.campus || "UC";

  return (
    <div className="pointer-events-none fixed left-2 top-4 z-[100] w-[min(23rem,calc(100vw-1rem))]">
      {/* El scroll sí se permite: "sin interactuables" es sin controles, no sin poder leer la ficha completa */}
      <div className="pointer-events-auto max-h-[60dvh] overflow-y-auto rounded-xl border border-border bg-background/95 shadow-xl backdrop-blur-md">
        <header className="border-b border-border px-4 pb-3 pt-4">
          <h3 className="text-xl font-bold leading-tight text-foreground">{place.properties.name}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SidebarLabel icon={Icons.Map} variant="primary" ariaLabel={`Campus ${campusDisplayName}`}>
              {campusDisplayName}
            </SidebarLabel>
            {categoryLabel ? (
              <SidebarLabel icon={Icons.MenuBook} variant="muted" ariaLabel={`Categoría ${categoryLabel}`}>
                {categoryLabel}
              </SidebarLabel>
            ) : null}
          </div>
        </header>

        <div className="flex flex-col gap-4 px-4 pb-5 pt-4">
          {place.properties.floors && place.properties.floors.length > 0 ? (
            <InfoRow icon={Icons.Floor} label="Piso" value={place.properties.floors.join(", ")} />
          ) : null}

          {place.properties.campus ? <InfoRow icon={Icons.Map} label="Campus" value={campusDisplayName} /> : null}

          {place.properties.information ? (
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-foreground">Descripción</h4>
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                <MarkDownComponent>{place.properties.information}</MarkDownComponent>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import * as Icons from "@/app/components/ui/icons/icons";
import { SubSidebarType } from "@/lib/types";

import CampusButton from "./CampusButton";

export default function CampusList({
  handleCampusClick,
  setActiveSubSidebar,
}: {
  handleCampusClick: (campus: string) => void;
  setActiveSubSidebar: (value: SubSidebarType) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-bold text-lg text-foreground">Campus</h3>
            <p className="text-xs text-muted-foreground">Explora nuestros campus</p>
          </div>
        </div>
        <button
          onClick={() => setActiveSubSidebar(null)}
          className="w-8 h-8 text-foreground bg-accent flex items-center justify-center rounded-full "
          aria-label="Cerrar menú"
        >
          <Icons.Close className="w-4 h-4" />
        </button>
      </div>

      {/* Campus section following sidebar pattern */}
      <div className="flex-1 p-4">
        <div className="flex flex-col gap-2">
          <p className="text-md font-semibold text-foreground">Selecciona un campus</p>
          <div className="w-full grid grid-cols-2 gap-2 desktop:grid-cols-1">
            <CampusButton
              name="SanJoaquin"
              displayName="San Joaquín"
              imageSrc="/images/campus/san_joaquin.jpg"
              onClick={handleCampusClick}
            />
            <CampusButton
              name="CasaCentral"
              displayName="Casa Central"
              imageSrc="/images/campus/casa_central.jpg"
              onClick={handleCampusClick}
            />
            <CampusButton
              name="Oriente"
              displayName="Oriente"
              imageSrc="/images/campus/oriente.jpg"
              onClick={handleCampusClick}
            />
            <CampusButton
              name="LoContador"
              displayName="Lo Contador"
              imageSrc="/images/campus/lo_contador.jpg"
              onClick={handleCampusClick}
            />
            <CampusButton
              name="Villarrica"
              displayName="Villarrica"
              imageSrc="/images/campus/villarrica.png"
              onClick={handleCampusClick}
              className="col-span-2 md:col-span-1"
            />
          </div>
        </div>

        {/* Footer informativo */}
        <div className="mt-6 p-3 bg-muted rounded-lg border border-border">
          <div className="flex items-center gap-2 text-xs">
            <p>Navega entre los diferentes campus de la universidad para encontrar ubicaciones específicas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

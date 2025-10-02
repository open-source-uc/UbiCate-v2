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
      <div className="flex items-center justify-between w-full px-4 py-3">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-bold text-lg text-foreground">Campus</h3>
            <p className="text-xs text-muted-foreground">Explora los campus UC</p>
          </div>
        </div>
        <button
          onClick={() => setActiveSubSidebar(null)}
          className="w-8 h-8 bg-primary flex items-center justify-center rounded-full cursor-pointer group hover:bg-secondary transition"
          aria-label="Cerrar menú"
        >
          <Icons.Close className="w-4 h-4 fill-background group-hover:fill-secondary-foreground" />
        </button>
      </div>

      {/* Campus section following sidebar pattern */}
      <section className="flex-1 px-4 pt-4 pb-8">
        <div className="flex flex-col gap-2">
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
      </section>

    </div>
  );
}

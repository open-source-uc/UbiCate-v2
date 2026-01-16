import { useSearchParams } from "next/navigation";

import { use, useEffect, useState } from "react";

import { NotificationContext } from "@/app/context/notificationCtx";
import { siglas } from "@/lib/types";

import { SearchDropdown } from "../../search/SearchDropdown";

export default function TopMobileSidebar() {
  const { component } = use(NotificationContext);
  const searchParams = useSearchParams();
  const [campusName, setCampusName] = useState<string | null>(null);

  useEffect(() => {
    const campusParam = searchParams.get("campus");
    const campus = campusParam || localStorage.getItem("defaultCampus");

    if (campus) {
      // Si es una sigla corta (2 letras), obtener el nombre completo
      // Si es un nombre largo, obtener la sigla y luego el nombre completo
      let fullName: string | undefined;

      if (campus.length === 2) {
        // Es una sigla como "SJ", obtener nombre completo directamente
        fullName = siglas.get(campus);
      } else {
        // Es un nombre largo como "SanJoaquin", primero obtener la sigla
        const sigla = siglas.get(campus);
        // Luego usar la sigla para obtener el nombre completo
        fullName = sigla ? siglas.get(sigla) : undefined;
      }

      setCampusName(fullName || campus);
    } else {
      setCampusName(null);
    }
  }, [searchParams]);

  return (
    <section className="fixed top-0 left-0 w-full z-50 py-2 px-4 flex flex-col md:flex-row lg:items-start lg:justify-start gap-2 pointer-events-auto">
      <div className="w-full mr-auto flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <SearchDropdown numberOfShowResults={5} />
        </div>
        {campusName ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary rounded-lg shadow-sm w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
            <span className="text-xs font-medium text-primary-foreground">Campus {campusName}</span>
          </div>
        ) : null}
        {component ? component : null}
      </div>
    </section>
  );
}

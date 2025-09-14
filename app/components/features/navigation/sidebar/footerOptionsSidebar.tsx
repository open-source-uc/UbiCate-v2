"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function FooterOptionsSidebar() {
  const searchParams = useSearchParams();

  return (
    <div className="w-full rounded-xl bg-primary hover:bg-primary/90">
      <div className="text-xs text-primary-foreground p-4 mobile:p-3 tablet:p-4">
        Proyecto Co-creado
        <Link 
          href="/creditos" 
          className="font-semibold block hover:underline focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2 focus:ring-offset-primary rounded"
        >
          Conoce a los Colaboradores
        </Link>
      </div>
    </div>
  );
}

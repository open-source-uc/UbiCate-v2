"use client";

import Link from "next/link";

export default function FooterOptionsSidebar() {
  return (
    <>
      <div className="w-full rounded-xl bg-primary">
        <div className="text-xs text-primary-foreground p-4 mobile:p-3 tablet:p-4">
          Proyecto Co-creado
          {/* Sin prefetch: este footer se desmonta y remonta con cada apertura del sidebar mobile, y
              Next re-agenda el prefetch en cada remonte. Ver CLAUDE.md. */}
          <Link href="/creditos" prefetch={false} className="font-semibold block hover:underline">
            Conoce a los Colaboradores
          </Link>
        </div>
      </div>
    </>
  );
}

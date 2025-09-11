"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function FooterOptionsSidebar() {
  const searchParams = useSearchParams();

  return (
    <>
      <div className="w-full rounded-xl bg-primary">
        <div className="text-xs text-primary-foreground p-4 mobile:p-3 tablet:p-4">
          Desarrollado bajo
          <Link href="/creditos" className="font-semibold block hover:underline">
            Alianza Estudiantes-Universidad
          </Link>
        </div>
      </div>
    </>
  );
}

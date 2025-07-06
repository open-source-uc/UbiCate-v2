"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function FooterOptionsSidebar() {
  const searchParams = useSearchParams();

  return (
    <>
      {/* <div className="w-full rounded-xl bg-accent">
        <div className="text-xs text-foreground p-4">
          ¿Crees que algo falta?
          <Link
            href={`/form-geo/${searchParams.get("campus") ? `?campus=${searchParams.get("campus")}` : ""}`}
            className="font-semibold block hover:underline"
          >
            Ayúdanos agregándolo
          </Link>
        </div>
      </div> */}
      <div className="w-full rounded-xl bg-primary">
        <div className="text-xs p-4">
          Desarrollado por
          <Link href="/creditos" className="font-semibold block hover:underline">
            Open Source UC
          </Link>
        </div>
      </div>
    </>
  );
}

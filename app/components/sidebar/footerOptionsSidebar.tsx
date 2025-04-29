"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function FooterOptionsSidebar() {
  const searchParams = useSearchParams();

  return (
    <>
      {/* <div className="w-full rounded-xl bg-brown-light">
        <div className="text-xs text-white-blue p-4">
          ¿Crees que algo falta?
          <Link
            href={`/form-geo/${searchParams.get("campus") ? `?campus=${searchParams.get("campus")}` : ""}`}
            className="font-semibold block hover:underline"
          >
            Ayúdanos agregándolo
          </Link>
        </div>
      </div> */}
      <div className="w-full rounded-xl bg-blue-location">
        <div className="text-xs text-white-blue p-4 mobile:p-3 tablet:p-4">
          Desarrollado por
          <Link href="/creditos" className="font-semibold block hover:underline">
            Open Source UC
          </Link>
        </div>
      </div>
    </>
  );
}

import Link from "next/link";

import * as Icon from "../icons/icons";

export default function LocationButton({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/seguridad" className="" tabIndex={-1}>
      <button
        onClick={() => {
          onClick?.();
        }}
        className={`p-1 rounded-full group
          bg-[#ef233c] hover:bg-[#c41e3a]
          border-[#ef233c] border-1 
          flex items-center justify-center w-12 h-12 
          pointer-events-auto cursor-pointer
          ease-in-out
          shadow-xl
         `}
        aria-label="Botón de emergencia y seguridad"
        title="Información de seguridad"
      >
        <Icon.Danger className="w-6 h-6 fill-white group-hover:fill-white" />
      </button>
    </Link>
  );
}

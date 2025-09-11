import Link from "next/link";

import * as Icon from "../icons/icons";

export default function LocationButton({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/seguridad">
      <button
        onClick={() => {
          onClick?.();
        }}
        className={`p-1 rounded-full
          bg-destructive hover:bg-destructive/80
          border-border border-1 text-foreground 
          flex items-center justify-center w-12 h-12 
          pointer-events-auto cursor-pointer
          ease-in-out
          hover:shadow-lg
         `}
      >
        <Icon.Danger className="w-6 h-6" />
      </button>
    </Link>
  );
}

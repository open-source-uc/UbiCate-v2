import * as Icons from "@/app/components/icons/icons";

interface CloseButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}

export default function CloseButton({ onClick, ariaLabel = "Cerrar menú", className = "" }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-foreground bg-accent flex items-center rounded-full hover:text-muted-foreground hover:bg-muted pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-50 w-6 h-6 p-1 ${className}`}
      aria-label={ariaLabel}
    >
      <Icons.Close />
    </button>
  );
}

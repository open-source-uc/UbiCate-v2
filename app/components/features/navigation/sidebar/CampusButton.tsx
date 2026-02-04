import Image from "next/image";

interface CampusButtonProps {
  name: string;
  displayName: string;
  imageSrc: string;
  onClick: (campus: string) => void;
  className?: string;
}

export default function CampusButton({ name, displayName, imageSrc, onClick, className = "" }: CampusButtonProps) {
  return (
    <button
      onClick={() => onClick(name)}
      onKeyDown={(e) => e.key === "Enter" && onClick(name)}
      aria-label={`Navega a Campus ${displayName}`}
      role="navigation"
      tabIndex={0}
      className={`relative w-full h-[100px] rounded-md cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 ease-out hover:scale-[1.03] hover:rotate-1 hover:shadow-lg hover:shadow-primary/20 ${className}`}
    >
      <Image
        src={imageSrc}
        alt={`Campus ${displayName}`}
        fill
        className="object-cover rounded-sm transition-all duration-300 group-hover:brightness-110"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-0% from-transparent via-60% via-accent/40 to-80% to-accent/80 rounded-sm transition-opacity duration-300 group-hover:opacity-90" />
      <div className="absolute top-14 right-0 p-3 w-full transition-transform duration-300 group-hover:translate-y-[-2px]">
        <span className="text-background text-sm font-semibold" aria-hidden="true">
          {displayName}
        </span>
      </div>
    </button>
  );
}

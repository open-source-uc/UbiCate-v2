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
      tabIndex={0}
      className={`relative w-full h-[120px] rounded-sm border-border border-1 shadow-lg overflow-hidden cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] ${className}`}
    >
      {/* Image Background */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={`Campus ${displayName}`}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Gradient Overlay - Enhanced for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-blforegroundack/10" />
      
      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        {/* Campus Name */}
        <div>
          <h3 className="text-background text-base font-bold tracking-wide drop-shadow-lg text-left">
            {displayName}
          </h3>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </button>
  );
}

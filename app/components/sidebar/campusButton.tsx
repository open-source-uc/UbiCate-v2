import Image from "next/image";

interface CampusButtonProps {
  campusKey: string;
  campusName: string;
  imageSrc: string;
  onClick: (campus: string) => void;
  className?: string;
}

export default function CampusButton({
  campusKey,
  campusName,
  imageSrc,
  onClick,
  className = "",
}: CampusButtonProps) {
  return (
    <button
      onClick={() => onClick(campusKey)}
      onKeyDown={(e) => e.key === "Enter" && onClick(campusKey)}
      aria-label={`Navega a Campus ${campusName}`}
      role="navigation"
      tabIndex={0}
      className={`relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${className}`}
    >
      <Image
        src={imageSrc}
        alt={`Campus ${campusName}`}
        fill
        className="object-cover rounded-lg transition-transform duration-300"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/100 rounded-lg" />
      <div className="absolute inset-0 bg-accent/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 rounded-lg" />
      <div className="absolute bottom-0 left-0 p-2 tablet:p-3">
        <span className="text-foreground text-sm tablet:text-md font-semibold" aria-hidden="true">
          {campusName}
        </span>
      </div>
    </button>
  );
}

import * as Icons from "@/app/components/icons/icons";

interface SidebarToggleButtonProps {
  onClick: () => void;
  className?: string;
}

export default function SidebarToggleButton({ onClick, className = "" }: SidebarToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`hover:text-muted-foreground pointer-events-auto cursor-pointer ${className}`}
    >
      <Icons.DockToRight className="w-6 h-6" />
    </button>
  );
}

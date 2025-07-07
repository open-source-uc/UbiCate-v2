interface DragHandleProps {
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onClick?: () => void;
  className?: string;
}

export default function DragHandle({
  onMouseDown,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onClick,
  className = "",
}: DragHandleProps) {
  return (
    <div
      className={`w-full h-7 cursor-grab active:cursor-grabbing flex justify-center items-center rounded-t-lg touch-pan-x ${className}`}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      role="button"
      aria-label="Drag to resize sidebar"
      tabIndex={0}
    >
      <div className="w-1/4 h-1.5 bg-foreground rounded-full mx-auto" />
    </div>
  );
}

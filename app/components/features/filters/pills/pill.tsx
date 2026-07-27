import React, { ReactNode } from "react";

interface PillProps {
  title: string;
  icon: ReactNode;
  bg_color: string;
  active: boolean;
  onClick: () => void;
  activateClassName?: string;
  noActivateClassName?: string;
  className?: string;
  description?: string;
  onEdit?: () => void;
}

function Pill({
  title,
  onClick,
  active,
  bg_color,
  activateClassName = "bg-primary text-background",
  noActivateClassName = "bg-background text-foreground",
  className = "w-full rounded-lg flex items-center px-2 py-1.5 border-1 border-border min-h-[48px]",
  icon,
  description,
  onEdit,
}: PillProps) {
  const iconElement = React.isValidElement<{ className?: string }>(icon)
    ? React.cloneElement(icon, {
        className: [icon.props.className, "w-5 h-5 fill-current"].filter(Boolean).join(" "),
      })
    : icon;

  return (
    <button
      onClick={onClick}
      type="button"
      className={`${className} 
        ${active ? activateClassName : noActivateClassName}
        pointer-events-auto cursor-pointer transition-colors duration-200
        group hover:bg-secondary`}
    >
      <div
        className={`flex items-center justify-center
        min-w-[24px] min-h-[24px] desktop:min-w-[28px] desktop:min-h-[28px]`}
      >
        <div className={`${bg_color} text-background w-8 h-8 rounded-sm flex justify-center items-center`}>
          {iconElement}
        </div>
      </div>
      <div className="px-2 text-left flex-1 min-w-0">
        <span className="text-xs font-medium group-hover:text-secondary-foreground desktop:text-sm leading-tight block truncate">
          {title}
        </span>
        {description ? (
          <span className="text-[10px] text-muted-foreground leading-tight block truncate mt-0.5">{description}</span>
        ) : null}
      </div>
      {onEdit ? (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onEdit();
            }
          }}
          className="text-[10px] text-muted-foreground hover:text-foreground shrink-0 ml-1"
        >
          Edit
        </span>
      ) : null}
    </button>
  );
}

export default Pill;

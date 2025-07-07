import React, { ReactNode } from "react";

interface CategoryProps {
  title: string;
  icon: ReactNode;
  bg_color: string;
  active: boolean;
  onClick: () => void;
  activateClassName?: string;
  noActivateClassName?: string;
  className?: string;
}

function Category({
  title,
  onClick,
  active,
  bg_color,
  activateClassName = "bg-primary",
  noActivateClassName = "bg-accent text-foreground",
  className = "w-full h-14 rounded-lg flex items-center px-2 py-1.5 desktop:flex-col desktop:p-3 desktop:text-center desktop:h-28",
  icon,
}: CategoryProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`${className} ${
        active ? activateClassName : noActivateClassName
      } pointer-events-auto cursor-pointer transition-colors duration-200
      hover:bg-muted`}
    >
      <div
        className={`flex items-center justify-center rounded-lg
        min-w-[24px] min-h-[24px] desktop:min-w-[32px] desktop:min-h-[32px] desktop:mb-2`}
      >
        <div
          className={`${bg_color} ${
            active ? "border-border border-1" : "border-none"
          } w-8 h-8 rounded-md flex justify-center items-center desktop:w-10 desktop:h-10`}
        >
          {icon}
        </div>
      </div>
      <span className="px-2 text-xs font-medium desktop:px-0 flex-1 flex items-center justify-center desktop:justify-center">
        {title}
      </span>
    </button>
  );
}

export default Category;

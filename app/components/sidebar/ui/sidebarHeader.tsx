import Link from "next/link";

import { ReactNode } from "react";

interface SidebarHeaderProps {
  title: string;
  isExpanded?: boolean;
  showLogo?: boolean;
  logoSrc?: string;
  logoAlt?: string;
  rightContent?: ReactNode;
  className?: string;
}

export default function SidebarHeader({
  title,
  isExpanded = true,
  showLogo = false,
  logoSrc,
  logoAlt = "Logo",
  rightContent,
  className = "",
}: SidebarHeaderProps) {
  return (
    <div className={`flex w-full px-2 py-2 ${className}`}>
      {showLogo && logoSrc && isExpanded ? (
        <Link href="/" className="block">
          <img src={logoSrc} className="pl-2" alt={logoAlt} width="118" />
        </Link>
      ) : null}

      {!showLogo && <h3 className="font-bold text-lg">{title}</h3>}

      <div className="flex w-full" />

      {rightContent}
    </div>
  );
}

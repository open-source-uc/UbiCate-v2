import type { ElementType, ReactNode } from "react";

const LABEL_VARIANTS = {
  primary: "border-primary/30 bg-primary/10 text-primary",
  muted: "border-border/70 bg-muted text-muted-foreground",
  accent: "border-secondary/40 bg-secondary/20 text-secondary-foreground",
} as const;

export type LabelVariant = keyof typeof LABEL_VARIANTS;

export type SidebarLabelProps = {
  icon: ElementType;
  children: ReactNode;
  variant?: LabelVariant;
  ariaLabel?: string;
};

const baseLabelClasses =
  "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider";

export function SidebarLabel({ icon: Icon, children, variant = "muted", ariaLabel }: SidebarLabelProps) {
  const accessibleLabel =
    ariaLabel ?? (typeof children === "string" || typeof children === "number" ? String(children) : undefined);

  return (
    <span className={`${baseLabelClasses} ${LABEL_VARIANTS[variant]}`} role="text" aria-label={accessibleLabel}>
      <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span>{children}</span>
    </span>
  );
}

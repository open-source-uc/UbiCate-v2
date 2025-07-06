import { ReactNode } from "react";

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  children?: ReactNode;
  className?: string;
}

export default function InfoCard({ icon, title, subtitle, value, children, className = "" }: InfoCardProps) {
  return (
    <div
      className={`bg-card rounded-xl p-4 border border-border/20 hover:bg-accent/5 transition-colors duration-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>
          <div>
            <span className="font-medium text-foreground block">{title}</span>
            {subtitle ? <span className="text-sm text-muted-foreground">{subtitle}</span> : null}
          </div>
        </div>
        {value ? (
          <div className="text-right">
            <span className="text-foreground font-medium">{value}</span>
          </div>
        ) : null}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
